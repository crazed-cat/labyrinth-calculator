google.charts.load('current', { packages: ['corechart'] });

function modeChange(event) {
  const mode = event.currentTarget.value;
  for (const opt of document.getElementsByClassName('mode_option')) {
    opt.hidden = true;
  }
  document.getElementById(mode).hidden = false;
}

function roundTen(x){
  let digit = 10**threshold;
  return(Math.round(x*digit)/digit);
}

function loseCat(floor) {
  /* 計算在爬樓層時掉入陷阱的貓數
  floor表示「離開」樓層,例如從11爬到12,floor要填11*/
  const trap_fl = trap.get(floor+1);
  let next = new Map();
  let prev = catlist.get(floor);

  for (const [cat, prob] of prev){
    if (cat<=cat_init-10){
      for (const t of trap_fl){
        p1 = next.get(cat+t[0])??0
        p2 = prob*t[1]
        next.set(cat+t[0], p1+p2);
      }
    }
  }
  catlist.set(floor+1,next)
}

function perdictFinalFloor(){
  let st_floor = document.getElementById("st_floor").valueAsNumber;
  cat_init = document.getElementById("cat_left").valueAsNumber;
  catlist.set(st_floor, new Map([[0,100]]));

  for (i=st_floor;i<100;i++){
    let x = 0;
    for (const [cat, prob] of catlist.get(i)){
      if (cat>cat_init-10){x+=prob}
    }
    if (roundTen(x)>0){data.push([`${i}層`,roundTen(x),`${i}層：${roundTen(x)}%`,'color: #3366CC']);}
    loseCat(i);
  }
  let x100=0;
  for (const [cat, prob] of catlist.get(100)){x100+=prob}
  if (roundTen(x100)>0){data.push(['100層',roundTen(x100),`100層：${roundTen(x100)}%`,'color: #3366CC']);}
  text.textContent = '以下為抵達各樓層的機率';
}

function luckTest(){
  let ed_floor = document.getElementById('ed_floor').valueAsNumber;
  cat_init = document.getElementById('cat_init').valueAsNumber-document.getElementById('lose').valueAsNumber*2;
  catlist.set(0, new Map([[0,100]]));
  let cat_fin = document.getElementById('cat_fin').valueAsNumber;
  let luck = 0;

  for (i=0;i<ed_floor;i++){
    let x = 0;
    for (const [cat, prob] of catlist.get(i)){
      if (cat>cat_init-10){x+=prob;}
    }
    luck+=x;
    if (roundTen(x)>0){data.push([`${i}層`,roundTen(x),`${i}層：${roundTen(x)}%`,'color: #3366CC']);}
    loseCat(i);
  }
  for (const [cat, prob] of catlist.get(ed_floor-1)){
    if (cat_init-cat-10>=0){
      if (cat_init-cat-10<cat_fin){luck+=prob;}
      if (roundTen(prob)>0){
        data.push([`${ed_floor}層，${cat_init-cat-10}貓`,roundTen(prob),`${i}層${cat_init-cat-10}貓：${roundTen(prob)}%`,'color: purple']);
      }
    }
  }
  text.textContent = `你的運氣贏過了${roundTen(luck)}%的人`;
}

function searchFloor(){
  let target_floor = document.getElementById('floor').valueAsNumber;
  if (target_floor == 0){data = ['消耗0貓',100,'消耗0貓：100%','color: #3366CC'];}
  else{
    cat_init = Infinity;
    catlist.set(0, new Map([[0,100]]));

    for (i=0;i<target_floor;i++){loseCat(i)}
    for (const [cat, prob] of catlist.get(target_floor-1)){
      if (roundTen(prob)>0){
        data.push([`消耗${cat}貓`,roundTen(prob),`消耗${cat}貓：${roundTen(prob)}%`,'color: #3366CC']);
      }
    }
  }
  text.textContent = `以下為地下${target_floor}層的機率表`;
}

let trap=new Map();
for (i=1;i<=100;i++) {
  if (i==100){trap.set(i,[[0,1]])}
  else if (i%10==0 || i==99){trap.set(i,[[6,1/5],[7,1/3],[8,1/3],[9,2/15]])}
  else if (i<30){trap.set(i,[[2,1/5],[3,1/3],[4,1/3],[5,2/15]])}
  else if (i<60){trap.set(i,[[3,1/5],[4,1/3],[5,1/3],[6,2/15]])}
  else {trap.set(i,[[4,1/5],[5,1/3],[6,1/3],[7,2/15]])}
}
let catlist;
let data;
let cat_init;
const threshold = 3; //取到小數點後第shreshold位
const text = document.getElementById('text_div');

document
  .getElementById("mode_selector")
  .addEventListener('change', modeChange);

document
  .getElementById("start_button")
  .addEventListener('click', function (){
    const mode = document.getElementById("mode_selector").value;
    data = [['情況', '機率', {role: 'tooltip'}, {role: 'style'}]];
    catlist = new Map();

    if (mode=='mode_1'){perdictFinalFloor();}
    else if (mode=='mode_2'){luckTest();}
    else {searchFloor();}

    const dataTable = new google.visualization.arrayToDataTable(data);
    const view = new google.visualization.DataView(dataTable);
    if (data.length<40){
      view.setColumns([
      0, 1, 2, 3,
      { type:'string', role:'annotation', calc: (dt, row) => `${dt.getValue(row,1)}%`}
      ]);
    }

    const len=data.length**0.5*100;

    const options = {
      titlePosition: 'none',
      width: 400,
      height: len,
      legend: {position: 'none'},
      chartArea: {
        top: 20,
        left: 100,
        right: 20,
        bottom: 50,
        //width: '100%',
        height: '100%'
      }
    };
    console.log(data);

    const chart = new google.visualization.BarChart(
      document.getElementById('chart_div')
    );
    chart.draw(view, options);
  });