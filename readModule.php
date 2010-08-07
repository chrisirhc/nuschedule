<?php
$url = $_GET['url'];
$handle = fopen($url,'r');
$contents = stream_get_contents($handle);
echo $contents;
?>
