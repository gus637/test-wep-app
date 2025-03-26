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
function warns(){
	global $vars;
	foreach ($vars as $var){
		if($var[0]) return true;
	}
	return false;
}
function postGetClean(string $varName, $giveError = false){
	try{
		$result = isset($_POST[$varName])? htmlspecialchars(trim($_POST[$varName])): "";
		if(is_numeric($result)) $result = (int)$result;
		return $result;
	}
	catch (\Exception $e){
		if($giveError) throw $e;
		else return "";
	}
}
/**
 * @param string $arrayString use "/" to get the value outof the array
 */
function get(string $arrayString, array $array) {
    $path = explode("/", $arrayString);
    $current = $array;  // Start from the provided array

    // Traverse each key in the path
    foreach ($path as $key) {
        if (isset($current[$key])) {
            $current = $current[$key];
        } else {
            throw new Exception("Variable '$key' not found in array.", 420);
        }
    }

    return $current;
}
function getSesion(string $arrayString){return get($arrayString, $_SESSION);}
function showWarning(string $for, $showerror=false){
	if(!isset($_POST["add_team"])) return;
	try{
		global $vars;
		if(!isset($vars[$for])) return;
		$var = $vars[$for];

		if(!$var[0]) return;
		return "<p class='warning'>".$var[1]."</p>";
	}
	catch(\Exception $e){
		if($showerror) throw $e;
	}
}
}
function getTeamId(string $name){
	require "./connect.php";
	$pdoQ = "SELECT teamId FROM team WHERE `name` = :name";
	$pdoS = $db->prepare($pdoQ);
	$pdoS->execute([":name" => $name]);
	return (int)$pdoS->fetch(PDO::FETCH_ASSOC)["teamId"];
}
function checkToken() {
    if (!isset($_COOKIE["loginToken"])) return false;

    include_once "connect.php";

    // Haal de teamId op via de opgeslagen sessie-naam
    $pdoS1 = $db->prepare("SELECT teamId FROM team WHERE `name` = :name");
    $pdoS1->execute([":name" => getSesion("name/1")]);
    $team = $pdoS1->fetch(PDO::FETCH_ASSOC);

    // Als er geen team gevonden is, return false
    if (!$team) return false;

    // Haal de token uit de database voor dit team
    $pdoS1 = $db->prepare("SELECT * FROM token WHERE teamID = :id AND token = :token");
    $pdoS1->execute([
        ":id" => $team["teamId"],
        ":token" => $_COOKIE["loginToken"]
    ]);
    $token = $pdoS1->fetch(PDO::FETCH_ASSOC);

    if ($token && strtotime($token["expirary"]) > time()) {
        return true;
    }

    return false;
}
function loginWithToken(){
	if (!isset($_COOKIE["loginToken"]) || isset($_SESSION["team"]))return false;
	include_once "connect.php";
	$token = htmlspecialchars($_COOKIE["loginToken"]);
	$pdoQ ="SELECT team.name, team.members, token.expiry 
			FROM token 
			INNER JOIN team 
			on team.teamId = token.tokenId 
			WHERE token.token = :token";
	$pdoS = $db->prepare($pdoQ);
	$pdoS->execute([":token" => $token]);
	if($pdoS->rowCount() < 1) return removeCookie();
	$data = $pdoS->fetch(PDO::FETCH_ASSOC);
	$vars = ["name" => [0, $data["name"]], "number" => [0, $data["members"]]];
	$_SESSION["team"] = $vars;
	return $data;
}
function makeToken(){
    require "connect.php";
    
    // Set the expiration date to 30 days from now
    $date = date("Y-m-d H:i:s", time() + 60 * 60 * 24 * 30);
    
    // Fetch existing tokens to ensure the generated token is unique
    $pdoS = $db->prepare("SELECT token FROM token");
    $pdoS->execute();
    $tokens = [];
    while ($row = $pdoS->fetch(PDO::FETCH_ASSOC)) {
        $tokens[] = $row["token"];
    }

    // Generate a random token and ensure it does not already exist in the database
    do {
        $token = bin2hex(random_bytes(34));
    } while (in_array($token, $tokens));

    // Get teamId based on the session name
    $teamId = getTeamId(getSesion("team/name/1"));

    // Insert new token into the database
    $pdoQ = "INSERT INTO token (teamId, token, expiry) VALUES (:id, :token, :data)"; 
    $pdoV = [
        ":id" => $teamId,
        ":token" => $token,
        ":data" => $date
    ];
    $pdoS = $db->prepare($pdoQ);
    $pdoS->execute($pdoV);

    // Set a login cookie with the generated token
    setcookie("loginToken", $token, strtotime($date), "/");
}
function removeCookie(){
	require "connect.php";

	// get the id of the team.
		$pdoQ ="SELECT teamId 
				from team 
				WHERE `name` = :name";

		$pdoS = $db->prepare($pdoQ);
		$pdoS->execute([":name" => getSesion("team/name/1")]);

		$id = $pdoS->fetch(PDO::FETCH_COLUMN)["teamID"];

	// delete the token of the groep and any that were expiret.
		$pdoQ ="DELETE FROM token 
				WHERE teamId = :id 
				OR expiry < NOW()";

		$pdoS = $db->prepare($pdoQ);
		$pdoS->execute([":id" => $id]);
	// remove the local cookie
		setcookie("loginToken", "", time()-1, "/");
}
/**
 * @return array{token: string, expiry: string}|false
 */
function getToken(string $from){
    require "connect.php";

    $teamId = getTeamId($from);

    $pdoQ = "SELECT token, expiry FROM token WHERE teamId = :id";
    $pdoS = $db->prepare($pdoQ);
    $pdoS->execute([":id" => $teamId]);

    return $pdoS->fetch(PDO::FETCH_ASSOC);
}
