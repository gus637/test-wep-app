<?php
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
	
	header("location:/");
	?>
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>invalid</title>
	</head>
	<body>
		<h1>invalid</h1>
	</body>
	</html>
	<?php
    exit;
}
else{
	require_once "functions.php"
	?>
	<nav>
		<p>
			<?php
			try{
			echo !isset($_SESSION["team"]) ? "gast" : 
			(getSesion("team/number/1") > 1? "groep: " : "gebruiker: ")
			.getSesion("team/name/1");}
			catch(\Exception $e){
				if(strchr($e->getMessage(), "1")){echo $_SESSION["team"]["name"][0];}
				else throw $e;
			}
			?>
		</p>
		<a href="./">home</a>
		<?php
		if(!isset($_SESSION["team"])){?>
		<a href="aanmelden">aanmelden</a>
		<a href="inloggen">inloggen</a>
		<?php
		}
		else{
			?>
			<a href="afmelden">afmelden</a>
			<?php
		}
		?>
	</nav>
	<?php
}
?> 