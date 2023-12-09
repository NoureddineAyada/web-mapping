 // Initialiser la carte
 var osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM({

    }),
    name:'OpenStreetMap'
 });
    


 var satelliteLayer = new ol.layer.Tile({
    source: new ol.source.TileImage({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // Exemple avec une source d'imagerie satellite ArcGIS
      crossOrigin: 'anonymous',
    }),
    name: 'ImageSat'
})
 var maCarte = new ol.Map({
    target: 'map',
    layers: [osmLayer,satelliteLayer],
    view: new ol.View({
        center: ol.proj.fromLonLat([-0.349989 , 35.8541575]), // Coordonnées de arzew
        zoom: 5
    })
    });

var layerswitcher = new ol.control.LayerSwitcher({
    activationMode:'click',
    startActive:false,
    groupSelectStyle: 'children'
});
maCarte.addControl(layerswitcher);


const fichier=document.getElementsByClassName('input')
fichier[0].addEventListener("change", () => {
    const file = fichier[0].files[0]
      fetch(file.name)
        .then((res) => {
            const image = new ol.style.Circle({
                radius: 5,
                fill: null,
                stroke: new ol.style.Stroke({color: 'red', width: 1}),
              });
            const styles = [
                new ol.style.Style({
                  image: image,
                }),
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 1,
                  }),
                }),
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: 'blue',
                    lineDash: [4],
                    width: 3,
                  }),
                  fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                  }),
                }),
              ]

            var vectorLayerJSON = new ol.layer.Vector({
                source: new ol.source.Vector({
                  format: new ol.format.GeoJSON(),
                  url: res.url
                }),
                name:file.name,
                style: styles
              });
              maCarte.addLayer(vectorLayerJSON);

            const layerGroup = document.getElementsByClassName('layergroup')[0];
            const div = document.createElement('div');
            div.className = 'layer';
            div.innerHTML='<input class="check" type="checkbox" name="'+file.name+'" checked><h3>'+file.name+'</h3>';
            layerGroup.appendChild(div);
            })
  });

  


  document.body.addEventListener('change',() =>{
    const checkInput=document.getElementsByClassName('check');
    for(let i=0; i<checkInput.length; i++){
      
      maCarte.getLayers().forEach(element => {
        if(element.get('name') === checkInput[i].name){
          element.setVisible(checkInput[i].checked);
        }
          
      });
      
    };
  })




  










