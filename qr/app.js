// const container = document.getElementById('container');

// for (let i = 0; i < 10; i++) {
//   container.innerHTML += `
//     <div id="e${i}" class="box"></div>
//   `;

//   setTimeout(() => {
//     const qrcode = new QRCode(`e${i}`, {
//       text: `${i}`,
//       width: 128,
//       height: 128,
//       colorDark: '#000',
//       colorLight: '#fff',
//       correctLevel: QRCode.CorrectLevel.H
//     });
//   }, 100);
// }

const container = document.getElementById('container');

for (let i = 0; i < 10; i++) {
  container.innerHTML += `
    <div id="e${i}" class="box"></div>
  `;

  setTimeout(() => {
    QrCreator.render(
      {
        text: `${i}`,
        radius: 0,
        ecLevel: 'H',
        fill: '#000',
        background: null,
        size: 128
      },
      document.getElementById(`e${i}`)
    );
  }, 1);
}
