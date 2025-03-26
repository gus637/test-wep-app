<?php 
session_start();
include "functions.php";
removeCookie();
session_unset();
header("Location: ./")
?>