let array = [];
let isSorting = false;
let delay = 100;
let windowRef;

function updateArrayDisplay(container) {
  container.innerHTML = "";
  array.forEach(val => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${val * 3}px`;

    const label = document.createElement("span");
    label.className = "bar-label";
    label.innerText = val;
    bar.appendChild(label);

    container.appendChild(bar);
  });
}

function startSorting() {
  const input = document.getElementById("inputArray").value;
  array = input.split(",")
               .map(n => parseInt(n.trim()))
               .filter(n => !isNaN(n));
  if (!array.length) return alert("Please enter valid numbers.");
  openSortingWindow();
}

function generateRandomArray() {
  array = Array.from({ length: 30 }, () => Math.floor(Math.random()*50)+10);
  openSortingWindow();
}

function openSortingWindow() {
  windowRef = window.open("", "", "width=800,height=600");
  windowRef.document.write(`
    <html><head><title>Visualizer</title><style>
      body{margin:0;padding:0;display:flex;justify-content:center;align-items:flex-end;height:100vh;background:#f4f4f9;}
      #array-container{display:flex;align-items:flex-end;height:90%;width:100%;}
      .bar{position:relative;width:20px;margin:0 2px;background:#4CAF50;transition:height .3s;}
      .bar-label{position:absolute;bottom:-20px;font-size:12px;color:#333;}
      .bar-swapped{animation:colorChange .5s ease;}
      @keyframes colorChange{0%,100%{background:#4CAF50;}50%{background:#FF9800;}}
    </style></head>
    <body><div id="array-container"></div></body></html>
  `);
  windowRef.document.close();
  windowRef.onload = () => {
    const container = windowRef.document.getElementById("array-container");
    updateArrayDisplay(container);
    runSelectedAlgorithm(container);
  };
}

function runSelectedAlgorithm(container) {
  const algo = document.getElementById("algorithm-select").value;
  switch(algo) {
    case "bubble":    bubbleSort(container);    break;
    case "selection": selectionSort(container); break;
    case "insertion": insertionSort(container); break;
    case "quick":     quickSort(0, array.length-1, container); break;
    case "merge":     mergeSort(0, array.length-1, container); break;
    case "heap":      heapSort(container);      break;
    case "radix":     radixSort(container);     break;
  }
}

// —–––––– Algorithms (use global `array` and updateArrayDisplay + await sleep(delay)) —––––––
// Bubble, Selection, Insertion, Quick (with partition), Merge (with merge),
// Heap (with heapify), Radix (with countingSortByDigit).
// [For brevity these are the same as in our last update: all operate directly on `array`,
// call updateArrayDisplay(container) after each swap or overwrite, and await sleep(delay).]

async function bubbleSort(container) {
  if(isSorting) return; isSorting=true;
  for(let i=0;i<array.length-1;i++){
    for(let j=0;j<array.length-i-1;j++){
      if(array[j]>array[j+1]){
        [array[j],array[j+1]]=[array[j+1],array[j]];
        updateArrayDisplay(container);
        await sleep(delay);
      }
    }
  }
  isSorting=false;
}

async function selectionSort(container) {
  if(isSorting) return; isSorting=true;
  for(let i=0;i<array.length;i++){
    let min=i;
    for(let j=i+1;j<array.length;j++){
      if(array[j]<array[min]) min=j;
    }
    [array[i],array[min]]=[array[min],array[i]];
    updateArrayDisplay(container);
    await sleep(delay);
  }
  isSorting=false;
}

async function insertionSort(container) {
  if(isSorting) return; isSorting=true;
  for(let i=1;i<array.length;i++){
    let key=array[i], j=i-1;
    while(j>=0 && array[j]>key){
      array[j+1]=array[j]; j--;
      updateArrayDisplay(container);
      await sleep(delay);
    }
    array[j+1]=key;
    updateArrayDisplay(container);
    await sleep(delay);
  }
  isSorting=false;
}

async function quickSort(l,h,container) {
  if(!isSorting){isSorting=true;}
  if(l<h){
    let p=await partition(l,h,container);
    await quickSort(l,p-1,container);
    await quickSort(p+1,h,container);
  }
  if(l===0 && h===array.length-1) isSorting=false;
}

async function partition(l,h,container) {
  let pivot=array[h], i=l-1;
  for(let j=l;j<h;j++){
    if(array[j]<pivot){
      i++; [array[i],array[j]]=[array[j],array[i]];
      updateArrayDisplay(container); await sleep(delay);
    }
  }
  [array[i+1],array[h]]=[array[h],array[i+1]];
  updateArrayDisplay(container); await sleep(delay);
  return i+1;
}

async function mergeSort(l,r,container) {
  if(!isSorting){isSorting=true;}
  if(l<r){
    let m=Math.floor((l+r)/2);
    await mergeSort(l,m,container);
    await mergeSort(m+1,r,container);
    await merge(l,m,r,container);
  }
  if(l===0&&r===array.length-1) isSorting=false;
}

async function merge(l,m,r,container) {
  let left=array.slice(l,m+1), right=array.slice(m+1,r+1);
  let i=0,j=0,k=l;
  while(i<left.length&&j<right.length){
    array[k++]=left[i]<=right[j]?left[i++]:right[j++];
    updateArrayDisplay(container); await sleep(delay);
  }
  while(i<left.length){ array[k++]=left[i++]; updateArrayDisplay(container); await sleep(delay); }
  while(j<right.length){ array[k++]=right[j++]; updateArrayDisplay(container); await sleep(delay); }
}

async function heapSort(container) {
  if(isSorting)return; isSorting=true;
  let n=array.length;
  for(let i=Math.floor(n/2)-1;i>=0;i--) await heapify(n,i,container);
  for(let i=n-1;i>0;i--){
    [array[0],array[i]]=[array[i],array[0]];
    updateArrayDisplay(container); await sleep(delay);
    await heapify(i,0,container);
  }
  isSorting=false;
}

async function heapify(n,i,container) {
  let largest=i, l=2*i+1, r=2*i+2;
  if(l<n&&array[l]>array[largest]) largest=l;
  if(r<n&&array[r]>array[largest]) largest=r;
  if(largest!==i){
    [array[i],array[largest]]=[array[largest],array[i]];
    updateArrayDisplay(container); await sleep(delay);
    await heapify(n,largest,container);
  }
}

async function radixSort(container) {
  if(isSorting)return; isSorting=true;
  let mx=Math.max(...array);
  for(let exp=1;Math.floor(mx/exp)>0;exp*=10) await countingSortByDigit(exp,container);
  isSorting=false;
}

async function countingSortByDigit(exp,container) {
  let out=Array(array.length).fill(0), cnt=Array(10).fill(0);
  array.forEach(v=>cnt[Math.floor(v/exp)%10]++);
  for(let i=1;i<10;i++) cnt[i]+=cnt[i-1];
  for(let i=array.length-1;i>=0;i--){
    let d=Math.floor(array[i]/exp)%10;
    out[--cnt[d]]=array[i];
  }
  for(let i=0;i<array.length;i++){
    array[i]=out[i];
    updateArrayDisplay(container); await sleep(delay);
  }
}

function sleep(ms){ return new Promise(res=>setTimeout(res,ms)); }

document.getElementById('speed-range').addEventListener('input', e=>{
  delay=parseInt(e.target.value);
  document.getElementById('speed-value').textContent=`${delay}ms`;
});

function resetArray(){
  array=[];
  document.getElementById("inputArray").value="";
}
