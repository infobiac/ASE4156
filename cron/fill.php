$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_RETURNTRANSFER => 1,
  CURLOPT_URL => "http://trading-stuff.herokuapp.com/stocks/fill/"));

$resp = curl_exec($curl);
var_dump($resp);
curl_close($curl);

