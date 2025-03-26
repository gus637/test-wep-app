<?php require "prosesing.php"; require_once "functions.php" ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>inlogen</title>
	<link rel="stylesheet" href="style.css">
</head>
<body>
	<?php include "nav.php"?>
	<main>
		<form action="inloggen" method="post">
			<?=showWarning("name")?>
			<label for="name">groep naam</label><input type="text" name="name" id="name" minlength="3" maxlength="20" required <?= isset($_POST["name"])? "value=\"".postGetClean("name")."\"": ""?>>
			<?=showWarning("pass")?>
			<label for="pass">wachtwoord</label><input type="password" name="pass" id="pass" minlength="6">
			<div class="buttons">
				<button type="submit" name="login" value="1">inlogen</button>
				<button type="reset">leeg maken</button>
			</div>
		</form>
	</main>
</body>
</html>