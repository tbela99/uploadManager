<?php
/**
 * @package classes.io
 * @author bela, http://tbela.net/
 */

 //defined('_JEXEC') or die('Direct access not allowed');
 
//if(!defined('C_UPLOADER')) {
 
 //define('C_UPLOADER', 1);

	// if(!defined('MY_LOADER'))
		// require_once(dirname(__FILE__).DS.'loader.php');
		
	/**
	* flags for file/directory copy, move
	*/
	define('_COPY_SKIP_ALWAYS', 0);
	/**
	* flags for file/directory copy, move
	*/
	define('_COPY_SKIP_IF_NEWER', 1);
	/**
	* flags for file/directory copy, move
	*/
	define('_COPY_SKIP_NEVER', 2);
	/**
	* flags for file/directory copy, move
	*/
	define('_COPY_CREATE_NEW', 3);

	 /**
	  * upload helper class
	  *
	  */
	class uploadHelper {
 
		/* name of the field(s) of type file in the form */
		protected $key_field;
		protected $sub_dir_path;
		protected $dir_path;
		
		protected static $filter = array(
							'A' => 'À|Á|Â|Ã|Ä|Å',
							'C' => 'Ç',
							'E' => 'È|É|Ê|Ë',
							'I' => 'Ì|Í|Î|Ï',
							'N' => 'Ñ',
							'O' => 'Ò|Ó|Ô|Õ|Ö',
							'U' => 'Ù|Ú|Û|Ü',
							'Y' => 'Ý',
							'a' => 'à|á|â|ã|ä|å',
							'c' => 'ç',
							'e' => 'è|é|ê|ë',
							'i' => 'ì|í|î|ï',
							'n' => 'ñ',
							'o' => 'ò|ó|ô|õ|ö',
							'u' => 'ù|ú|û|ü',
							'y' => 'ý|ÿ'
						);
				
		//generate guid
		public static function uuid() {
	  
		   // The field names refer to RFC 4122 section 4.1.2

		   return sprintf('%04x%04x-%04x-%03x4-%04x-%04x%04x%04x',
			   mt_rand(0, 65535), mt_rand(0, 65535), // 32 bits for "time_low"
			   mt_rand(0, 65535), // 16 bits for "time_mid"
			   mt_rand(0, 4095),  // 12 bits before the 0100 of (version) 4 for "time_hi_and_version"
			   bindec(substr_replace(sprintf('%016b', mt_rand(0, 65535)), '01', 6, 2)),
				   // 8 bits, the last two of which (positions 6 and 7) are 01, for "clk_seq_hi_res"
				   // (hence, the 2nd hex digit after the 3rd hyphen can only be 1, 5, 9 or d)
				   // 8 bits for "clk_seq_low"
			   mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535) // 48 bits for "node" 
		   ); 
		}
		
		public static function clean($string) {
		
			foreach(self::$filter as $value => $regExp)
				$string = preg_replace('#('.$regExp.')#Us', $value, $string);
			
			return $string;
		}
			
		 /**
		  * file name without extension
		  *
		  * @param string $file
		  * @return string
		  */
		public static function file_name($file) { return preg_replace('/(\.[^\.]+){1,2}$/', '', self::clean(basename($file))); }
	
		/**
		 * truncate a string and return a string of a maximum of $length characters, if $smart is true then the input string will not truncate in the middle of a word
		 *
		 * @param string $str
		 * @param int $length
		 * @param string $append
		 * @param boolean $smart
		 * @return string
		 */
		public static function truncate($str, $length = 80, $append = '...', $smart = true) {
		
			if(strlen($str) <= $length || $length == 0)
				return $str;
				
			if(!$smart)
				return substr($str, 0, max($length - strlen($append), 0)).$append;
				
			return preg_replace('/(((<[^\/][^>]*>)|(<[^>]*)|(\w|-|\(|\[|<))*)\z/m', '', substr($str, 0, max($length - strlen($append), 0))).$append;
		}

		public static function getVar($name) {
		
			return self::get_param($_REQUEST, $name);
		}
		/*
		
			route method to implement if you use SEF url
		*/
		public static function route($url) {

			//return JRoute::_($url);
			return $url;
		}

		/*
		
			public method to generate security token
		*/
		public static function token() {
		
			return '';
		}

		/*
		
			public method to validate security token
		*/
		public static function checkToken() {
		
			return true;
		}

		/*
		
			public method to encrypt path
			please use a more obscur encryption
		*/
		public static function encrypt($name, $key = '') {
		
			return base64_encode($name);
		}

		/*
		
			public method dor path decription
		*/
		public static function decrypt($name, $key = '') {
		
			return base64_decode($name);
		}

		public static function get_param($array, $key, $default = null) {

			return isset($array[$key]) ? $array[$key] : $default;
		}

		 /**
		  * file extension: file_ext(a.tar.gz) = tar.gz
		  *
		  * @param string $file
		  * @return string
		  * @see file_ext2()
		  */
		public static function file_ext($file) {

			preg_match('/(\.[^\.]+){1,2}$/', basename($file), $m);
			return substr(self::get_param($m, 0), 1);
		}

		 /**
		  * file extension: file_ext2(a.tar.gz) = gz
		  *
		  * @param string $file
		  * @return string
		  * @see file_ext()
		  */
		function file_ext2($file) {

			preg_match('/(?:\.)([^\.]*){1,1}$/', basename($file), $m);
			return self::get_param($m, 1);
		}
		
		   /**
			* file copy
			* <pre>
			* $overwrite :
			*			- _COPY_SKIP_ALWAYS : skip existing
			*			- _COPY_SKIP_IF_NEWER : skip existing if it is newer
			*			- _COPY_SKIP_NEVER : always overwrite
			*			- any other value considered as _COPY_SKIP_ALWAYS
			*	if $dest is a file, it might be replaced depending on the value of $overwrite
			*	if $dest is a directory, $source will be copied into this directory
			* </pre>
			* @param string $dest
			* @param string $source
			* @param boolean $overwrite
			* @return boolean true on succes
			* @see file_move()
			*/
		public static function file_copy($dest, $source, $overwrite = _COPY_SKIP_ALWAYS) {

			if($dest == $source)
				return false;

			if(basename($source) == '')
				return false;

			if(is_dir($dest))
				$dest = self::add_path_delimiter($dest).basename($source);
			
			if(!is_file($source) || !self::mkdirs(dirname($dest)))
				return false;
				//source == dest ?
				if(is_file($dest)) {
					//existing but older or always overwrite
					if($overwrite == _COPY_CREATE_NEW)
						$dest = self::create_filename($dest);
						
					if(($overwrite == _COPY_SKIP_IF_NEWER && filemtime($source) > filemtime($dest)) || $overwrite == _COPY_SKIP_NEVER || $overwrite == _COPY_CREATE_NEW) {
					
						if(!copy($source, $dest))
						return false;
						
						touch($dest, filemtime($source));
					}
					//else don't touch
					return true;
				}

			//file_exists return true if the file is a directory, but is_file return false and the copy will fail
			//not a file, already tested with is_file
			if(file_exists($dest))
				return false;

			if(copy($source, $dest)) {
				touch($dest, filemtime($source));
				return true;
			}
			return false;
		}

		 /**
		  *
		  *
		  * @param string $path
		  * @return string
		  */
		public static function add_path_delimiter($path) {

			if($path == '')
				return $path;
			$path = str_replace('/', DS, $path);

			if($path[strlen($path) - 1] == DS)
				return $path;
			return $path.DS;
		 }

		 /**
		  * generate smart file name like file.php, file(1).php if file.php exists, and so on... but DOES NOT create the file
		  *
		  * @param  string $name
		  * @param string $dir directory where file will be created, may not exist. if not specified, the current directory is used. the directory is not created
		  * @return string
		  * @internal now better handling of files name like 'file.tar.gz'
		  */
		public static function create_filename($name, $dir = '', $lowercaseext = false) {

			$name = self::clean($name);
			
			$dir = self::add_path_delimiter($dir);
			$path = $dir.$name;

			if(!file_exists($path))
				return $path;

			$ext = self::file_ext($lowercaseext ? strtolower($name) : $name);
			
			if(!$dir)
				$dir = self::add_path_delimiter($dir.dirname($name));
				
			$base = self::file_name($name);

			$i = 1;
			while(file_exists($dir. $base. '('.$i.').'.$ext)) $i++;
			return $dir. $base. '('.$i.').'.$ext;
		 }

		public static function truncate_str($str, $length = 80, $append = '...', $smart = true) {
		
			if(strlen($str) <= $length || $length == 0)
				return $str;
			if(!$smart)
				return substr($str, 0, max($length - strlen($append), 0)).$append;
			return preg_replace('/(((<[^\/][^>]*>)|(<[^>]*)|(\w|-|\(|\[|<))*)\z/m', '', substr($str, 0, max($length - strlen($append), 0))).$append;
		}

		public static function str_search($str, $quote_style = ENT_QUOTES, $charset = 'utf-8') {

		 return iconv($charset, $charset.'//IGNORE', html_entity_decode(preg_replace('/&(.)(acute|circ|grave|uml|cedil|tilde);/si', '$1', htmlentities($str, $quote_style, $charset)), $quote_style, $charset));
		}
		
		public static function safe_name($name) { 
 
			return strtolower(preg_replace('/[^a-z0-9,._]+/i', '-', self::str_search($name)));
		}

		 /**
		  *
		  * @param string $path
		  * @return string
		  */
		public static function remove_path_delimiter($path) {

			if($path == '')
				return $path;
			$path = str_replace(array('\\', '/'), DS, $path);

			if($path[strlen($path) - 1] == DS)
				return substr($path, 0, strlen($path) - 1);
			return $path;
		 }

		public static function mkdirs($directory) {

			if(is_dir($directory))
				return $directory;

			//existing but not a directory!
			if(file_exists($directory))
				return false;

			$directory = str_replace("\\", "/", self::remove_path_delimiter($directory));
			$directory = str_replace("/", DS, self::remove_path_delimiter($directory));

			if(!($dirs = explode(DS, $directory)))
				return false;

			$dir = $dirs[0];

			//linux/unix system, fix bug ?
			if($directory[0] == '/')
				$dir = '/'.$dir;

			if(!is_dir($dir.DS) && !file_exists($dir))
			
				if(!mkdir($dir)) {
						// echo ' '.$dir;
						return false;
				}

			// chmod($dir, $chmod);
			
			for($j = 1; $j < count($dirs); $j++) {

				$dir .= "/".$dirs[$j];
				if(!is_dir($dir.'/') && !file_exists($dir))
					if(!mkdir($dir)) {
						// echo ' '.$dir;
						return false;
					}
			
				// chmod($dir, $chmod);
			}
			
			// chmod($dir, $chmod);
			return $dir;
		 }

		  /**
		   * file upload helper class
		   *
		   * @param string $sub_dir where to put uploaded files
		   * @param string $key_field upload form file name
		   * @return uploadHelper
		   */
		public function __construct($sub_dir = TEMP_PATH, $key_field = 'file') {

			if(!($this->dir_path = $this->mkdirs($sub_dir)))
				die("failed to build $sub_dir");

			if(!is_file($this->dir_path.DS.'index.html'))
				file_put_contents($this->dir_path.DS.'index.html', '<html></html>');
				
			$this->key_field = $key_field;
		}

		  /**
		   * upload a single file, return false on error
		   *
		   * @return array
		   */
		function upload_file() {
		  
			$res = array();
			
			if($this->get_param($this->get_param($_FILES, $this->key_field), 'error') != UPLOAD_ERR_OK)
				return false;
			
			$path = $this->create_filename($this->get_param($this->get_param($_FILES, $this->key_field), 'name'), $this->dir_path);
			
			if(!$this->file_copy ($path, $this->get_param($this->get_param($_FILES, $this->key_field), 'tmp_name')))
				return false;

			/* file name */
			$res[0]['name'] = $_FILES[$this->key_field]['name'];
			
			/* uploaded file name */
			$res[0]['path'] = $path;
			
			/* uploaded file mimetype */
			$res[0]['type'] = $_FILES[$this->key_field]['type'];
			
			return $res;
		}

	  /**
	   * upload multiple files, return false on error
	   *
	   * @return array
	   */
		function upload_files() {
	  
			$res = array();
			
			if(is_array($this->get_param($this->get_param($_FILES, $this->key_field), 'name'))) {
			
				for($i = 0; $i < count($_FILES[$this->key_field]['name']); $i++) {
				
					if($_FILES[$this->key_field]['error'][$i] != UPLOAD_ERR_OK)
						return false;
						
					$path = $this->create_filename ($_FILES[$this->key_field]['name'][$i], $this->dir_path);
					
					if(!$this->file_copy ($path, $_FILES[$this->key_field]['tmp_name'][$i]))
						return false;

					$res[$i]['name'] = $_FILES[$this->key_field]['name'][$i];
					$res[$i]['path'] = $path;
					$res[$i]['type'] = $_FILES[$this->key_field]['type'][$i];
				}
				
			} else return $this->upload_file();
			
			return $res;
		}
	}
//}
?>