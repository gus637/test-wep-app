<?php
$DB_NAME = "project";
$server = "localhost";
$user = "root";
$password = "";
try {$db = new PDO("mysql:host=$server;dbname=$DB_NAME", $user, $password);}
catch(PDOException $e){
	$msg = '
		<p>
			Regelnummer: '.$e->getLine().'<br />
			Bestand: '.$e->getFile().'<br />
			Foutmelding: '.$e->getMessage().'
		</p>
		';
	trigger_error($msg);
	die();
}