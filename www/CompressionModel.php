<?php


class CompressionModel
{

    public function saveStat($quantity, $size_before, $size_after, $quality_option, $size_option)
    {
        include RELATIVE_PATH . 'database.php';
        $query = $db->prepare("INSERT INTO " . $db_prefix . "compression(address,quantity,size_before_kb,size_after_kb,quality_option,size_option,date)
                                VALUES (?,?,?,?,?,?,NOW())");
        $query->execute([
            $_SERVER['REMOTE_ADDR'],
            $quantity,
            $size_before,
            $size_after,
            $quality_option,
            $size_option,
        ]);
    }

}