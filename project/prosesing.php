<?php 
session_start();
# responce code, value/mesage
$vars = array();
require "functions.php";
if(isset($_SESSION["team"])){
	header("location:./");
}
elseif(isset($_POST["add_team"])){
	if(!isset($_POST["name"])) $vars["name"] = [400, "de groep moet een naam hebben."];else{
		global $name;
		$name = postGetClean("name");
		$len = strlen($name);
		if($len < 3) $vars["name"] = [400, "de groep naam moet ten minsten 3 letters lang zijn."];
		elseif($len > 20) $vars["name"] = [400, "de groep naam mag maar 20 letters hebben."];
		else $vars["name"] = [0, $name];
	}
	if(!isset($_POST["number"])) $vars["number"] = [400, "een team kan niet destaan zonder leden."];else{
		global $number;
		$number = postGetClean("number");
		if(!is_int($number)) $vars["number"] = [400, "de antal leden moet een nummer zijn."];
		elseif($number == 0) $vars["number"] = [400, "een team kan niet destaan zonder leden."];
		else $vars["number"] = [0, $number];
	}
	if(isset($_POST["pass"])){
		$pass = postGetClean("pass");
		if(!$pass){}
		elseif(strlen($pass) < 6) $vars["pass"] = [400, "de wachtwoord moet ten minsten 6 tekkens lang zijn"];
		else {
			global $passHass;
			$passHass = password_hash($pass, PASSWORD_BCRYPT);
			$vars["pass"] = [0, $passHass];
		}
	}
	if (!warns()) {
		try {
			include_once "connect.php";
			$pdoQ = "INSERT INTO team (`name`, members, passHash) VALUES (:name, :members, :passHash)";
			$pdoV = [
				":name" => $name,
				":members" => $number,
				":passHash" => isset($vars["pass"]) ? $passHass : ""
			];
			$pdoS = $db->prepare($pdoQ);
			$pdoS->execute($pdoV);
			
			$_SESSION["team"] = $vars;
			if(isset($vars["pass"]))makeToken();
			header("location:./");
			exit;
		} catch (\PDOException $th) {
			$errorMsg = $th->getMessage();
			if(strpos($errorMsg, "Duplicate entry") !== false && strpos($errorMsg, "for key 'team.team_name'") !== false)
			$vars["name"] = [400, "Een groep heeft die naam all."];
			else $vars["pdo"] = [240, $errorMsg];
		}
	}
}
elseif(isset($_POST["login"])){
	if(!isset($_POST["name"])) $vars["name"] = [400, "de groep naam moet ingevuld worden."];
	else{
		$name = postGetClean("name");
		$len = strlen($name);
		if($len < 3) $vars["name"] = [400, "de groep naam moet ten minsten 3 letters lang zijn."];
		elseif($len > 20) $vars["name"] = [400, "de groep naam mag maar 20 letters hebben."];
		else $vars["name"] = [0, $name];
	}
	if(!warns()){
		require "connect.php";
		$pdoQ = "SELECT * FROM team WHERE `name` = :name";
		$pdoS = $db->prepare($pdoQ);
		$pdoS->execute([":name" => $name]);
		if($pdoS->rowCount() < 1) $vars["pdo"] = [420, "er destaat geen groep met die naam."];
		else{
			$row = $pdoS->fetch(PDO::FETCH_ASSOC);
			if(!$row["passHash"]) $vars["name"] = [400, "Deze groep heeft geen wachtwoord."];
			elseif(!password_verify(postGetClean("pass"), $row["passHash"])) $vars["pass"] = [400, "onjuiste wachtwoord."];
			else{
				$vars["name"] = [0, $row["name"]];
				$vars["number"] = [0, $row["members"]];
				$_SESSION["team"] = $vars;
				try{
					makeToken();
				}
				catch (\PDOException $e){
					$msg = $e->getMessage();
					if(strchr($msg, "Duplicate entry") !==false && strchr($msg, "token.owner")){
						$data = getToken(getSesion("team/name/1"));
						setcookie("loginToken", $data["token"], strtotime($data["expiry"]), "/");
					}
					else{
						throw $e;
						exit;
					}
				}
				finally {
					header("location:./");
					exit;
				}
			}
		}
	}
}