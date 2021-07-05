/* 
  使用ライブラリ
  Parser ID：1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw
  Moment ID：15hgNOjKHUG4UtyZl9clqBbl23sDvWMS8pfDJOyIapZk5RBqwL3i-rlCo
 */

function myFunction() {

  var getUrl = "https://www.joqr.co.jp/qr/agregularprogram/";
  var html = UrlFetchApp.fetch(getUrl).getContentText('UTF-8');
  var weekDay = 1  // 1=月曜 7=日曜

  //各曜日の番組終了時間 初期値は放送の開始時間
  var week = ["06:00", "06:00", "06:00", "06:00", "06:00", "06:00", "06:00"]


  var programs = [[], [], [], [], [], [], []]   //番組情報が入る配列　各要素が月曜～日曜

  //openById('ここにスプレッドシートのIDを入力');
  var spreadsheet = SpreadsheetApp.openById('1ME9GA9ZGvlLyk8_Xgc6JLgXTiAAGLd89A0reEj14lAo');

  //getSheetByName('ここにシート名を入力');
  var sheet = spreadsheet.getSheetByName('番組リスト');

  //    <tr></tr>を削除
  var tbody = Parser.data(html).from('<tbody>').to('</tbody>').build()
  tbody = tbody.replace(/<tr>[\s]*?<!--[\s\S]*?-->[\s]*?<\/tr>/g, "")
  tbody = tbody.replace(/\n/g, "")

  tbody = tbody.replace(/<tr>?<.tr>/g, " ")

  //いったんすべての<tr>を取得
  var allTable = Parser.data(tbody).from('<tr>').to('</tr>').iterate();


  //大量にある空のテーブルを削除しつつ、一つの時間帯のテーブルを取得　例10時台のテーブル
  var timeZoneTable = []
  allTable.forEach((table) => {
    table = table.replace("\n", "")
    if (table !== "    ") {
      timeZoneTable.push(table)

    }
  })

  //28時、29時台の番組テーブルを削除　番組があるなら修正
  timeZoneTable.pop()
  timeZoneTable.pop()

  //時間帯テーブルの番組要素を取得
  timeZoneTable.forEach((table) => {
    var timeZoneProgramElement


      //テーブルにある番組データ要素を取得 複数曜日にまたがっている場合と、分ける
    if (table.includes("colspan")) {
      timeZoneProgramElement = divisionColspan(table)
    }
    else {
      timeZoneProgramElement = Parser.data(table).from('<td').to('</td>').iterate()
    }

    timeZoneProgramElement.forEach((element) => {

      //番組データから番組情報オブジェクトを取得
      var program = CreateProgram(element)

      //番組データを曜日ごとに分けて積み上げ
      var next = 0

      //取得した番組の開始時間と、前番組の終了時間が一致する曜日を検索、push
      for (var i = 6; i >= 0; i--) {
        if (program.startTime === week[i]) { next = i }
      }

      //該当曜日の終了時間を更新
      week[next] = program.endTime

      //ここで時間を24時間制に変更する
      program.startTime = To24moment(program.startTime).format("HH:mm")
      program.endTime = To24moment(program.endTime).format("HH:mm")

      //曜日番号を取得　1=月　7=日 24時を過ぎていたら、翌日曜日
      program.week = next + 1
      program.week = program.week + IsCheckNextday(program.startTime)
      if (program.week === 8) program.week = 1

      //放送日を計算
      program.broadcastDay = WeeklybroadcastDay(program.week)

      //APIkey
      program.apikey = "ag" + program.week + program.startTime.replace(":", "")

      programs[next].push(program)
    })
  })

  //番組情報をスプレッドシートに記述
    WriteSpreadsheet(programs, sheet)

}






