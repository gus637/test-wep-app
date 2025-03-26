<?php include_once "prosesing.php" ?>

<!DOCTYPE html>
<html lang="nl">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>aanmelden</title>
	<link rel="stylesheet" href="style.css">
</head>
<body class="aanmelden">
	<?php include "nav.php" ?>
	<main>
		<?php 
		if(warns()){
			if(isset($vars["pdo"])){
				echo "<p class='warning'>".get("pdo/1", $vars)."</p>"; 
			}
		}
		?>
		<form action="./aanmelden.php" method="post">
			<?=showWarning("name")?>
			<label for="name" >groep naam*</label><input type="text" name="name" id="name" minlength="3" maxlength="20" required value="<?=postGetClean("name")?>" <?=!warns() && isset($_SESSION["team"])? "disabled='disabled'" : ""?>>
			<?=showWarning("number")?>
			<label for="number">aantal leden*</label><input type="number" name="number" id="number" min="1" value="<?= isset($_POST["number"])? postGetClean("number") : 1?>" required <?=!warns() && isset($_SESSION["team"])? "disabled='disabled'" : ""?>>
			<?=showWarning("pass")?>
			<label for="pass">wachtwoord</label><input type="password" name="pass" id="pass" minlength="6" <?=!warns() && isset($_SESSION["team"])? "disabled='disabled'" : ""?>>
			<div class="buttons">
				<button type="submit" name="add_team" value="1" <?=!warns() && isset($_SESSION["team"])? "disabled='disabled'" : ""?>>aanmelden</button>
				<button type="reset">leeg maken</button>
			</div>
		</form>
	</main>
</body>
</html>