
//プログラムオブジェクト作成
function CreateProgram(element) {
  //開始時間を取得
  var startTime = Parser.data(element).from('<div class="weeklyProgram-time">').to('</div>').build();
  startTime = To30moment(To24moment(startTime))

  //オンエア時間を取得
  var onAirTime = Parser.data(element).from('rowspan="').to('"').build();

  //放送終了時間を取得
  var endTime = ProgramEndTime(startTime, onAirTime)


  //動画放送かどうか
  var video = false
  if (element.includes("icon_program-movie")) {
    video = true
  }

  //リピート放送かどうか
  var repeat = false
  if (element.includes("is-repeat")) {
    repeat = true
  }

  var contentElement = Parser.data(element).from('<div class="weeklyProgram-content">').to('</div>').build()

  //タイトル要素の抽出
  var title = Parser.data(contentElement).from('">').to('</a>').build()
  if (contentElement.includes("放送休止")) { title = "放送休止" }

  //パーソナリティの抽出
  var personalitys = Parser.data(contentElement).from('<span class="personality">').to('</span>').iterate()
  var personality = ""
  for (const p in personalitys) {
    if (p > 0) personality += "、"
    personality += Parser.data(personalitys[p]).from('">').to('</a>').build()
  }
  personality = personality.replace("\n", "")

  return { "startTime": startTime, "endTime": endTime, "onAirTime": onAirTime, "title": title, "personality": personality, "video": video, "repeat": repeat }
}


//複数の曜日にまたがる番組を曜日ごとに分割
function divisionColspan(table) {

  var timeZoneProgramElement = []
  //テーブルにある番組データ要素を取得
  var tableData = Parser.data(table).from('<td').to('</td>').iterate()

  //テーブルデータにcolspanがあったら、colspanの値ぶんに増やす
  for (p in tableData) {
    if (tableData[p].includes("colspan")) {
      var colspan = Parser.data(tableData[p]).from('colspan="').to('"').build()
      for (var i = 0; i < colspan; i++) {
        timeZoneProgramElement.push(tableData[p])
      }
    } else {
      timeZoneProgramElement.push(tableData[p])
    }
  }

  return timeZoneProgramElement
}

function IsCheckNextday(date) {
  var time = Moment.moment(date, "HH:mm")
  if (time.format("H") < 6)
    return 1
  return 0
}


//27時間stringから24時間のmomentオブジェクトを返す
function To24moment(date) {
  date = date.replace('24:', '00:')
  date = date.replace('25:', '01:')
  date = date.replace('26:', '02:')
  date = date.replace('27:', '03:')
  date = date.replace('28:', '04:')
  return Moment.moment(date, "HH:mm")
}
//24時間momentオブジェクトから27時間stringを返す
function To30moment(date) {
  var stringDate = date.format("HH:mm")
  stringDate = stringDate.replace('00:', '24:')
  stringDate = stringDate.replace('01:', '25:')
  stringDate = stringDate.replace('02:', '26:')
  stringDate = stringDate.replace('03:', '27:')
  stringDate = stringDate.replace('04:', '28:')
  return stringDate
}


//放送終了時間を計算
function ProgramEndTime(startTime, onAirTime) {
  var date = To24moment(startTime)

  date.add(Number(onAirTime), "minutes")
  return To30moment(date)
}


function WeeklybroadcastDay(weekDay) {
  //現在の曜日を取得
  var today = Moment.moment()
  var todayweek = today.format("d")
  if (todayweek <= weekDay) { //todayが曜日よりも小さいなら今週
    addDay = today.add(weekDay - todayweek, "days")
  }
  else {  //todayが曜日よりも小さいなら来週
    addDay = today.add(7 + weekDay - todayweek, "days")
  }
  return addDay.format("YYYYMMDD")
}


//スプレッドシートに記述
function WriteSpreadsheet(programs, sheet) {

  var item = {
    startTime: 'startTime',
    endTime: 'endTime',
    onAirTime: 'onAirTime',
    title: 'title',
    personality: 'personality',
    video: 'video',
    repeat: 'repeat',
    week: 'week',
    broadcastDay: 'broadcastDay',
    apikey: 'apikey'
  }
 var row = 1
  //スプレッドシートに番組情報を貼り付け
      sheet.getRange(row, 1).setValue('apikey')
      sheet.getRange(row, 2).setValue('week')
      sheet.getRange(row, 3).setValue('broadcastDay')
      sheet.getRange(row, 4).setValue('startTime')
      sheet.getRange(row, 5).setValue('endTime')
      sheet.getRange(row, 6).setValue('onAirTime')
      sheet.getRange(row, 7).setValue('title')
      sheet.getRange(row, 8).setValue('personality')
      sheet.getRange(row, 9).setValue('video')
      sheet.getRange(row, 10).setValue('repeat')
      row++
 

  programs.forEach((weekProgram, index) => {
    weekProgram.forEach((program) => {

      sheet.getRange(row, 1).setValue(program.apikey)
      sheet.getRange(row, 2).setValue(program.week)
      sheet.getRange(row, 3).setValue(program.broadcastDay)
      sheet.getRange(row, 4).setValue(program.startTime.replace(":", ""))
      sheet.getRange(row, 5).setValue(program.endTime.replace(":", ""))
      sheet.getRange(row, 6).setValue(program.onAirTime)
      sheet.getRange(row, 7).setValue(program.title)
      sheet.getRange(row, 8).setValue(program.personality)
      sheet.getRange(row, 9).setValue(program.video)
      sheet.getRange(row, 10).setValue(program.repeat)
      row++
    })
  })

}


