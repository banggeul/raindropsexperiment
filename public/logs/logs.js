getData();

async function getData() {
  const response = await fetch('/raindrops');
  console.log("dump all data here")
  const data = await response.json();
  // console.log(data);
  data.forEach(d=>{
    console.log(d);
  })
}
