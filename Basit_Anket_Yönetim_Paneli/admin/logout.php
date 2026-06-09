<?php
session_start();
require_once __DIR__ . "/../config/helpers.php";
session_destroy();
redirect("/survey-panel/admin/login.php");
