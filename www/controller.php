<?php

define("ABSOLUTE_PATH", __DIR__);
define("RELATIVE_PATH",ABSOLUTE_PATH.'/');
header('Content-type: application/json');
include RELATIVE_PATH . 'CompressionModel.php';

if (!empty($_POST)) {
    if ($_POST['action'] === 'compress') {
        $imageName = $_FILES['file_upload']['name'];
        $maxSize = $_POST['maxSize'];
        $path = $_FILES['file_upload']['tmp_name'];
        ini_set('memory_limit', "2048M");

        // type d'extension
        $ext = substr($imageName, strrpos($imageName, '.') + 1);
        // nom du fichier
        $fileNameExplode = explode('.', $imageName);
        $fileName = $fileNameExplode[0];
        for ($i = 1; $i < count($fileNameExplode) - 1; $i++) {
            $fileName .= "." . $fileNameExplode[$i];
        }
        // image source
        $image_source_path = $path;
        // indique la cible
        $image_target_path = RELATIVE_PATH.'photos_compressed/' . $fileName . "." . $ext;

        // Redimensionne l'image
        $image = imagecreatefromstring(file_get_contents($image_source_path));
        $width_before = imagesx($image);
        $height_before = imagesy($image);
        if ($width_before < $maxSize && $height_before < $maxSize || $maxSize === 'existing') {
            // Photo plus petite que la taille mini ou taille existante sélectionnée, donc on ne change pas
            $finalWidthLayer = $width_before;
            $finalHeightLayer = $height_before;
        } else if ($width_before > $height_before) {
            // photo en paysage
            $finalWidthLayer = $maxSize;
            $finalHeightLayer = $maxSize / $width_before * $height_before;
        } else {
            // photo en portrait
            $finalWidthLayer = $maxSize / $height_before * $width_before;
            $finalHeightLayer = $maxSize;
        }
        $image = imagescale($image, $finalWidthLayer, $finalHeightLayer);
        imagejpeg($image, $image_target_path, $_POST['quality']);
        echo json_encode($imageName);
        exit();
    } elseif ($_POST['action'] === 'downloadFiles') {
        $imageNames = json_decode($_POST['images']);
        $zip = new ZipArchive;
        $fileName = RELATIVE_PATH.'photos_compressed/'.generateRandomString(32).'.zip';
        $zip->open($fileName, ZipArchive::CREATE);
        $quantity = count($imageNames);
        //TODO sauvegarde db

        foreach ($imageNames as $imageName) {
            if(file_exists(RELATIVE_PATH.'photos_compressed/' . $imageName)) {
                $download_file = file_get_contents(RELATIVE_PATH.'photos_compressed/' . $imageName);
                #add it to the zip
                $zip->addFromString($imageName, $download_file);
                unlink(RELATIVE_PATH.'photos_compressed/' . $imageName);
            }
        }
        $zip->close();
        $Compression = new CompressionModel;
        $Compression->saveStat($quantity, floor($_POST['sizeBefore']/1024), floor(filesize($fileName)/1024), $_POST['quality'],$_POST['maxSize']);
        echo json_encode($fileName);
        exit();
    }
}

function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}