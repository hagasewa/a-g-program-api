
//api出力をする関数
function doGet(e) {

  //openById('ここにスプレッドシートのIDを入力');
  var spreadsheet = SpreadsheetApp.openById('1ME9GA9ZGvlLyk8_Xgc6JLgXTiAAGLd89A0reEj14lAo');
  //getSheetByName('ここにシート名を入力');
  var sheet = spreadsheet.getSheetByName('番組リスト');

  //シートからデータのある最終行列値を取得
  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()

  //Getで送られてくる値 例 ~~  exec?key=abc
  var key = e.parameter.key;

  //シート全データ取得
  var range = sheet.getRange(2, 1, lastRow, lastCol)
  var values = range.getValues()

  var AgApiJSON = {}

  //JSON化
  for (var i = 0; i < lastRow; i++) {
    AgApiJSON[values[i][0]] =
    {
      key: values[i][0],
      week: values[i][1],
      broadcastDay: values[i][2],
      startTime: values[i][3],
      endTime: values[i][4],
      onAirTime: values[i][5],
      title: values[i][6],
      personality: values[i][7],
      video: values[i][8],
      repeat: values[i][9]
    }
  }

  if (key === "all") {  //全データ出力
    var result = AgApiJSON
  }
  else if (key === "now") { //現在放送中の番組情報
    key = NowOnairkey(AgApiJSON)
    var result = AgApiJSON[key]

  }
  else {  //それ以外のキーでkeyと一致する番組
    var result = AgApiJSON[key]
  }

  //出力形式を修正
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  out.setContent(JSON.stringify(result));

  return out;
}


//現在放送している番組keyを出力
//現曜日の番組を抽出し、現時刻が開始時間と終了時間の間にある番組を出力
function NowOnairkey(programs) {
  var weeklyPrograms = []
  var nowProgram = {}
  var now = Moment.moment()

  //現在の曜日と時間を取得
  var week = now.format("d")
  var time = Number(now.format("HDD"))

  //現曜日の番組を抽出
  if (week === 0) week = 7
  Object.keys(programs).forEach((key) => {
    var isWeek = String(programs[key].week)
    if (week === isWeek)
      weeklyPrograms.push(programs[key])
  })

  //現時刻に放送している番組を検索
  weeklyPrograms.forEach((program) => {
    var start = Number(program.startTime)
    var end = Number(program.endTime)
    if (end === 0) end = 2400
    if (start <= time && time < end)
      nowProgram = program
  })
  return nowProgram.key
}
