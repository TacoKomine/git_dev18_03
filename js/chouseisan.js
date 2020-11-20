var list_events = [];

//===========================
// Utility
//===========================
/**
 * 二次元配列または連想配列の並び替え
 * @param {*[]} array 並び替える配列
 * @param {'ASC'|'DESC'} [order] 並び替える方法
 * @param {...*} args 並び替えの基準となるキー
 * @return {*[]} 並び替えられた配列
 */
var sortBy = function(array, order) {
    if (!order || !order.match(/^(ASC|DESC)$/i)) order = 'ASC';
    order = order.toUpperCase();
 
    var keys = [];
    for (var i = 2, len = arguments.length; i < len; i++) keys.push(arguments[i]);
 
    var targets = [].concat(array);
 
    targets.sort(function(a, b) {
        for (var i = 0, len = keys.length; i < len; i++) {
            if (typeof keys[i] === 'string') {
                if (order === 'ASC') {
                    if (a[keys[i]] < b[keys[i]]) return -1;
                    if (a[keys[i]] > b[keys[i]]) return 1;
                } else {
                    if (a[keys[i]] > b[keys[i]]) return -1;
                    if (a[keys[i]] < b[keys[i]]) return 1;
                }
            } else {
                var localOrder = keys[i].order || 'ASC';
                if (!localOrder.match(/^(ASC|DESC)$/i)) order = 'ASC';
                order = order.toUpperCase();
 
                if (localOrder === 'ASC') {
                    if (a[keys[i].key] < b[keys[i].key]) return -1;
                    if (a[keys[i].key] > b[keys[i].key]) return 1;
                } else {
                    if (a[keys[i].key] > b[keys[i].key]) return -1;
                    if (a[keys[i].key] < b[keys[i].key]) return 1;
                }
            }
        }
        return 0;
    });
    return targets;
};

//---------------------------------------
//  イベントクラス
//---------------------------------------
const eventClass = class {
    constructor() { /* コンストラクタ */
      this.event_name = "";
      this.event_details = "";
      this.event_producer = "";
      this.candidates = [];
    }
    set_eventSettings( event_name, event_detail, producer ){
        this.event_name = event_name;
        this.event_details = event_detail;
        this.event_producer = producer;
    }
    set_CandiDates( candi_date, candi_timezone ){  /* メソッド */
        this.candidates.push([candi_date, candi_timezone]);
        var sorted_candidates = sortBy(this.candidates, 'ASC', 0, 1);
        this.candidates = sorted_candidates;
    }
    get_CandiDates(){
        return( this.candidates );
    }
    get_allInfo(){
        var message = "イベント名：" + this.event_name;
        message += "| 説明：" + this.event_detail;
        message += "| 主催者：" + this.event_producer;
        message += "| 候補日時：" ;

        for( i=0; i< this.candidates.length; i++){
            message += "{" + this.candidates[i][0] + ", " + this.candidates[i][1] + "}" ;
        }
        return( message );
    }
    get_Jsonized(){
        var jsonized = {
            event_name : this.event_name,
            event_detail : this.event_details,
            event_producer : this.event_producer,
            candidates : this.candidates
          };
        return( JSON.stringify(jsonized) );
    }
  }
//---------------------------------------
// イベント作成クリックイベント
//---------------------------------------
$("#btn_newEvent").on("click", function () {
    new_event = new eventClass(null);
    $("#sec_event_setting").css("visibility","visible");
    $("#btn_newEvent").attr({"disabled":"true"});
});

//---------------------------------------
// Save クリックイベント
//---------------------------------------
$("#btn_save").on("click", function () {

// val()で値を取得する
// const key = $("#key").val();
// const value = $("#memo").val();

var event_name = $('#name_event').val();

for( i=0; i< list_events.length; i++){
    tmp_event = list_events[i];
    if( tmp_event.event_name == event_name ){
        alert("既に同じ名前のイベントが設定されています");
        return;
    }
}

var event_detail = $('#memo_event_detail').val();
var event_producer = $('#name_producer').val();
new_event.set_eventSettings(event_name, event_detail, event_producer);

// 入力フォーム候補日時表の行列数をカウント
// 候補をクラスに格納
//行数取得
var num_candids = tbl_candidate_dates.rows.length - 1;
console.log("候補数： " + num_candids);

for( i = 0; i < num_candids; i++ ){
    var tmp_date = $('input[name="候補日_'+ (i+1) +'"]').val();
    var tmp_time_zone = $('select[name="候補時間_'+ (i+1) +'"]').val();
    console.log( tmp_date + ", "+ tmp_time_zone);
    new_event.set_CandiDates(tmp_date, tmp_time_zone);
}

console.log( new_event.get_allInfo() );
// データを保存する
localStorage.setItem( event_name, new_event.get_Jsonized());

//イベントクラス初期化
new_event = new eventClass();
});

//---------------------------------------
// clear クリックイベント
//---------------------------------------
$("#btn_del_event").on('click', function () {
    // 保存されたデータ（localStorage）を消す
    localStorage.clear();
    //id="list"を削除する
    $("#event_details").empty();
});

//---------------------------------------
// ページ読み込み：保存データ取得表示
//---------------------------------------
for (let i = 0; i < localStorage.length; i++) {
    // 保存されたデータのkeyを取得
    const key = localStorage.key(i);
    console.log(key, 'key')

    // getItemのKeyを使って保存されたデータを全部取得
    const value = localStorage.getItem(key);
    console.log(value, 'value')

    const html = `<li><span>${value}</span></li>`
    $("#list").append(html);
}

/* ----------------------------------------------------
// 候補の日付を入力する際の表型フォーム
// 
// 【参考】 
//  https://www.northwind.mydns.jp/samples/table_sample1.php 
// ----------------------------------------------------

// appendRow: テーブルに行を追加 */
// 対象： <form id="frm_date"> <table id="tbl_candidate_dates">
function appendRow()
{
    var objTBL = document.getElementById("tbl_candidate_dates");
    if (!objTBL){ return; }
    
    var count = objTBL.rows.length;
    
    // 最終行に新しい行を追加
    var row = objTBL.insertRow(count);

    // 列の追加
    // 日付
    var c1 = row.insertCell(0);
    // 時間
    var c2 = row.insertCell(1);

    // 各列に表示内容を設定
    c1.innerHTML = '<input name="候補日_' + count + '" type="date" id="candi_date_' + count + '">';
    c2.innerHTML = '<select name="候補時間_' + count + '" class="candi_timezone" id="candi_timezone_' + count + '" >'
                    + '<option value="empty"></option>'
                    + '<option value="15:00">15:00 ~ </option>'
                    + '<option value="16:00">16:00 ~ </option>'
                    + '<option value="17:00">17:00 ~ </option>'
                    + '<option value="18:00">18:00 ~ </option>'
                    + '<option value="19:00">19:00 ~ </option>'
                    + '<option value="20:00">20:00 ~ </option>'
                    + '<option value="21:00">21:00 ~ </option>'
                    + '</select>';
    
    // 追加した行の入力フィールドへフォーカスを設定
    var objInp = document.getElementById("txt" + count);
    if (objInp){
        objInp.focus();
    }
}

/*
 * deleteRow: 削除ボタン該当行を削除
 */
function deleteRow(obj)
{
    // 確認
    if (!confirm("この候補日時を削除しますか？")){return;}

    if (!obj){return;}

    var objTR = obj.parentNode.parentNode;
    var objTBL = objTR.parentNode;
    
    if (objTBL)
        objTBL.deleteRow(objTR.sectionRowIndex);
    
    // ↓↓↓------ここから多分いらない //
    // <span> 行番号ふり直し
    var tagElements = document.getElementsByTagName("span");
    if (!tagElements){return false;}

    var seq = 1;
    for (var i = 0; i < tagElements.length; i++)
    {
        if (tagElements[i].className.match("seqno"))
            tagElements[i].innerHTML = seq++;
    }

    // id/name ふり直し
    var tagElements = document.getElementsByTagName("input");
    if (!tagElements)
        return false;

    // <input type="text" id="txtN">
    var seq = 1;
    for (var i = 0; i < tagElements.length; i++)
    {
        if (tagElements[i].className.match("inpval"))
        {
            tagElements[i].setAttribute("id", "txt" + seq);
            tagElements[i].setAttribute("name", "txt" + seq);
            ++seq;
        }
    }
    // ここまで--------↑↑↑↑ //
}

/*
* カレンダーの使い勝手向上のための関数
*/
function formatDate(dt) {
    var y = dt.getFullYear();
    var m = ('00' + (dt.getMonth()+1)).slice(-2);
    var d = ('00' + dt.getDate()).slice(-2);
    return (y + '-' + m + '-' + d);
  }
// 今日以降の日付は選択できない
$('input[type="date"]').on('click', function () {
    var today = formatDate( new Date() );
    console.log( today );
    $('input[type="date"]').attr({'min': today})
});

//========================================
// 出席可否入力
//========================================

//---------------------------------------
// 入力対象の選択と候補日時表示
//---------------------------------------
$("#targ_event").on('click', function () {
    $("#targ_event").empty();
    $("#targ_event").append('<option value="empty">入力するイベントを選んでください</option>');
    
    //ローカルストレージ内の全てのevent classを参照
    for( i = 0; i < localStorage.length; i++ ){
        var event_name = localStorage.key(i);
        console.log(event_name);

        //選択リスト: id="targ_event" に追加
        $("#targ_event").append('<option value="'+ event_name +'">'+ event_name + '</option>');
    } 
});

var targ_candidates;
let select = document.querySelector('[id="targ_event"]');
select.onchange = event => { 
    $("#tbl_results").empty();
    $("#tbl_results").append('<tr><th>日付</th><th>時間帯</th></tr>');
    var name_attendee = $('#name_attendee').val();
    var targ_event_key = $('#targ_event').val();
    var targ_event = JSON.parse( localStorage.getItem(targ_event_key) );
    targ_candidates = targ_event["candidates"];
    console.log(targ_candidates);

    for( i =0; i< targ_candidates.length; i++ ){
        $("#tbl_results").append('<tr>'
                                    + '<td>' + targ_candidates[i][0] + '</td>'
                                    + '<td>' + targ_candidates[i][1] + '</td></tr>');
    }
    // テーブル取得
    var table = document.getElementById("tbl_results");

    // 行数取得
    var rows = table.rows.length;
            
    console.log( targ_candidates);
    // 各行末尾にセルを追加
    for ( var i = 0; i < rows; i++) {
        var cell = table.rows[i].insertCell(-1);
        var cols = table.rows[i].cells.length;
        if (cols > 10) {
            continue;
        }
        if( i == 0){
            cell.innerHTML = '<p>' + name_attendee + '</p>'
        }else{
            cell.innerHTML = '<select id="' + targ_candidates[i] + "," + name_attendee + '" >'
                            + '<option value="empty"></option>'
                            + '<option value="ok">出席</option>'
                            + '<option value="maybe">不明</option>'
                            + '<option value="impossible">欠席</option>'
                            + '</select>';
        }
    }
}

//---------------------------------------
// ダミー：回答結果送信ボタン
//---------------------------------------
$("#btn_submit").on('click', function () {
    alert("出欠を回答しました");
});
