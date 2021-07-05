# 概要
GAS（Google App Script）を利用して、[文化放送A&Gチャンネルの番組表](https://www.joqr.co.jp/qr/agregularprogram/)を1日1回スクレイピングして、放送情報を取得し、APIで出力した。
GASを使う理由しては、単にPythonが使えないのと、サーバーを利用せずともAPIを出力してくれるから。

# スクレイピング
GASでスクレイピングするのに「`Parser`」というライブラリを利用させていただいた。
``` 
ID：1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw
```
`from`で指定した文字列から`to`で指定したBの間の文字列を取得できる  
`build`は最初に取得した文字列を返す  
`iterate`は該当文字列を配列にして返す
```parser.js
tbody= Parser.data(htmlCode).from('<tbody>').to('</tbody>').build()
tds=Parser.data(htmlCode).from('<td>').to('</td>').iterate()
```
Parserを使ってのスクレイピングは、あくまでも文字列操作をするだけなので、取得した文字列をどんどん細分化していき、地道に必要な文字列を探し出していった。

# スプレッドシートに出力
スクレイピングしたデータは週間の番組表なので、そのデータをもとに当日から1週間の番組予定にデータ処理して、スプレッドシートに出力した  
`openById`でスプレッドシートのIDを指定し、`getRange`でセルを指定して書き込んでいく
```SpreadsheetOutput.js
  var spreadsheet = SpreadsheetApp.openById('******');
  var sheet = spreadsheet.getSheetByName('番組リスト');

  sheet.getRange(row, col).setValue(title)
```
# API出力
スプレッドシートに書き込まれたデータを読み込んで、getリクエストに応じてJSONを返す  

```
function doGet(e) {
  key = e.parameter.key

  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  out.setContent(JSON.stringify(result));
```
`e.parameter.key`に入力されたデータが格納されているので、それを取り出し、`key`に応じて、`result`を返す
`out`はJSONで返すための定型文としておけばOK

# デプロイ
処理が完成したら、画面右上にあるデプロイ処理をする  
新しいデプロイ→種類の選択→ウェブアプリ→アクセスできるユーザー→全員  
```
https://script.google.com/macros/s/AKfycbz49-g39n3pAoHJiFriwJbtTKP4T0Q_y8u_d699qjwP0qCxGa0BmJyDV1SVBoKRfQq2/exec?key=all
```
exec?key=にAPI要求も文字列を記述すれば、該当の番組情報JSONを返す
デプロイするたびに、URLも変わるので、上記URLは変更の保証しない

## APIキー
特定番組：頭文字をagとして曜日（1~7）と24時間表記の時間を記述  
`ag12000　（ag + 曜日 + 時間）`  
全番組：`all`と記述  
放送中番組：`now`と記述  

# コード
あまり綺麗なコードではないが、どなたか利用するようでしたら参考にしてください  Github
