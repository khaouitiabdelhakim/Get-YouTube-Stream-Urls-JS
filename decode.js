var BPa = function (a) {
  a = a.split("");
  LO.HI(a, 2);
  LO.kf(a, 56);
  LO.HI(a, 3);
  LO.Gl(a, 10);
  LO.HI(a, 2);
  LO.Gl(a, 41);
  LO.Gl(a, 37);
  return a.join("");
};
var LO = {
  Gl: function (a, b) {
    var c = a[0];
    a[0] = a[b % a.length];
    a[b % a.length] = c;
  },
  kf: function (a) {
    a.reverse();
  },
  HI: function (a, b) {
    a.splice(0, b);
  },
};

const patSigEncUrl = /url=(.+?)(\u0026|$)/;
const patSignature = /s=(.+?)(\u0026|$)/;

urlo = `s=%3Dg%3Dg5aNic06Y4EQywoc3FBV69QuljZ9xSMFObXzWm_qJH1AEiAji8xb4sUq5teTkO3niA-_gC12aA4xLXGZKLcY3NyHVNAhIgqwsSdQfJqJRqJR&sp=sig&url=https://rr5---sn-f5o5-jhoz.googlevideo.com/videoplayback%3Fexpire%3D1719268770%26ei%3DQqF5ZquWK_e4p-oPp_mzmA0%26ip%3D105.73.96.62%26id%3Do-AOYAmb4-l3DpBCLj8PxevWSKEAORHZcJheXzqR2TALBi%26itag%3D251%26source%3Dyoutube%26requiressl%3Dyes%26xpc%3DEgVo2aDSNQ%253D%253D%26mh%3Dlu%26mm%3D31%252C29%26mn%3Dsn-f5o5-jhoz%252Csn-h5qzened%26ms%3Dau%252Crdu%26mv%3Dm%26mvi%3D5%26pl%3D25%26initcwndbps%3D580000%26bui%3DAbKP-1MoUnBIyQL87WHC05UmLxS9U4sAlIPuSI6lAqQj7vgJuDQhUBk9sbdSVwohlr6rNVGNSxHSPtSt%26spc%3DUWF9f7UPZ9uweVHIe4tuPRGX6v-Hk8kUEtJPzmDfI-eV0RGooQ%26vprv%3D1%26svpuc%3D1%26mime%3Daudio%252Fwebm%26ns%3Dka9lDisc9dxDnP6yX38Qhp0Q%26rqh%3D1%26gir%3Dyes%26clen%3D4414846%26dur%3D260.321%26lmt%3D1714877283035474%26mt%3D1719246782%26fvip%3D4%26keepalive%3Dyes%26c%3DWEB_REMIX%26sefc%3D1%26txp%3D4502434%26n%3DMS3zR3E9l2I4N7wT9U%26sparams%3Dexpire%252Cei%252Cip%252Cid%252Citag%252Csource%252Crequiressl%252Cxpc%252Cbui%252Cspc%252Cvprv%252Csvpuc%252Cmime%252Cns%252Crqh%252Cgir%252Cclen%252Cdur%252Clmt%26lsparams%3Dmh%252Cmm%252Cmn%252Cms%252Cmv%252Cmvi%252Cpl%252Cinitcwndbps%26lsig%3DAHlkHjAwRgIhAMua7Ghhsro_6M2__PONQwgtLZRrwvHpNKdDHs1SqnxTAiEAxfbjfiDknd60u401z0mPxeYwidSIgqtzoMNGKapq5P4%253D`


const mat = patSigEncUrl.exec(urlo);
const matSig = patSignature.exec(urlo);
if (mat && matSig) {
  let url = decodeURIComponent(mat[1]);
  const signature = decodeURIComponent(matSig[1]);
  url += `&sig=${BPa(signature)}`;
  console.log(url);
}
