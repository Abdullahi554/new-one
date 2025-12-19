<?php

header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "shop_receipts";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die(json_encode(["status"=>"error","message"=>$conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["status"=>"error","message"=>"Invalid JSON"]);
    exit;
}

/* INSERT DATA */
$stmt = $conn->prepare("
    INSERT INTO receipts (order_number, chair, date, items, subtotal, vat, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

$orderNumber = $data['orderNumber'];
$chair = intval($data['chair']);
$date = $data['receiptDate'];
$items = json_encode($data['items']);
$subtotal = $data['subtotal'];
$vat = $data['vat'];
$total = $data['total'];

$stmt->bind_param("sissddd", $orderNumber, $chair, $date, $items, $subtotal, $vat, $total);

if (!$stmt->execute()) {
    echo json_encode(["status"=>"error","message"=>$stmt->error]);
    exit;
}

/* GET INSERTED ID */
$insertedId = $conn->insert_id;
$stmt->close();

/* FETCH EXACT ROW FROM DATABASE */
$get = $conn->prepare("SELECT * FROM receipts WHERE id = ?");
$get->bind_param("i", $insertedId);
$get->execute();

$result = $get->get_result();
$row = $result->fetch_assoc();

$get->close();
$conn->close();

/* RETURN ONLY DATABASE DATA */
echo json_encode([
    "status" => "success",
    "data" => $row
]);
