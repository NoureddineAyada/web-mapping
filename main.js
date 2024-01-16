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



let GeoTIFFloader = function (img, src) {
  const self = this;
  const canvas = document.createElement('canvas');
  GeoTIFF.fromUrl(src)
    .then(tiff => tiff.getImage()
      .then(image => {
        const width = image.getWidth();
        const height = image.getHeight();
        const bbox = image.getBoundingBox();
        // world files (TFW) not supported!
        
        canvas.width = width;
        canvas.height = height;
        self.extent = bbox;
        image.readRGB().then(raster => {

          // render raw image data (rgb) to canvas
          let ctx = canvas.getContext("2d");
          let imageData = ctx.createImageData(width, height);
          let o = 0;
          for (let i = 0; i < raster.length; i += 3) {
            imageData.data[o] = raster[i];
            imageData.data[o + 1] = raster[i + 1];
            imageData.data[o + 2] = raster[i + 2];
            imageData.data[o + 3] = 255;
            o += 4;
          }
          ctx.putImageData(imageData, 0, 0);

          img.getImage().src = canvas.toDataURL();
        })
      }))
    .catch(error => console.error(error));
};

let SHPloader = function (extent, resolution, projection) {
  const self = this;
  shapefile.open(self.getUrl())
    .then(source => source.read()
      .then(function load(result) {
        if (result.done) return;
        self.addFeatures(
          self.getFormat().readFeatures(result.value)
        );
        return source.read().then(load);
      }))
    .catch(error => self.removeLoadedExtent(extent))
};


const fichier=document.getElementById('files')
fichier.addEventListener("change", () => {
    const file = fichier.files[0]
    const fileExtension = file.name.split('.').pop();
    console.log(fileExtension)
    const path = URL.createObjectURL(file);
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

    if(fileExtension === "geojson") {
      fetch(file.name)
        .then((res) => {
            
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
    }
    else if( fileExtension === 'tiff' || fileExtension === 'tif'){
        var geotiff = new ol.layer.Image({
          title: file.name,
          source: new ol.source.ImageStatic({
            imageLoadFunction:GeoTIFFloader,
            imageExtent: ol.proj.get('EPSG:3857').getExtent(),
            url:path
          }),
          visible:true
        })
        maCarte.addLayer(geotiff)
        const layerGroup = document.getElementsByClassName('layergroup')[0];
          const div = document.createElement('div');
          div.className = 'layer';
          div.innerHTML='<input class="check" type="checkbox" name="'+file.name+'" checked><h3>'+file.name+'</h3>';
          layerGroup.appendChild(div);
        
    }
    
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



  const points=document.getElementById('points')
  points.addEventListener('change',function(){
    var file = points.files[0]
    const fileExtension = file.name.split('.').pop();
    const layerGroup = document.getElementsByClassName('layergroup')[0];
    const div = document.createElement('div');
    div.className = 'layer';
    div.innerHTML='<input class="check" type="checkbox" name="'+file.name+'" checked><h3>'+file.name+'</h3><select id="'+file.name+'"><option value="" selected disabled>Liste</option></select>';
    layerGroup.appendChild(div);
    const path = URL.createObjectURL(file);
    const stl = new ol.style.Style({
      image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({ color: 'green' }),
          stroke: new ol.style.Stroke({ color: 'black', width: 2 })
      })
    });

    var src = new ol.source.Vector({wrapX: false});
    var vector = new ol.layer.Vector({
      source: src,
      style:stl,
      title:file.name,
      name:file.name
    })

    var select = document.getElementById(file.name)
    console.log(select)
    var reader = new FileReader()
    reader.readAsText(file)
    reader.onload=function(e){
      var data = e.target.result;
      var lignes = data.split('\n');
      for(let i=1;i<lignes.length;i++){
        var col = lignes[i].split('\t')
        if(isNaN(col[0])==false && isNaN(col[1])==false && isNaN(col[2])==false){
          var option = document.createElement("option");
          option.value = col[0];
          option.text = col[0];
          select.appendChild(option);
          var x = parseFloat(col[1])
          var y = parseFloat(col[2])
          src.addFeature(new ol.Feature({
            geometry:new ol.geom.Point(ol.proj.fromLonLat([x, y])),
            id:col[0],
          }));
        }
        
        
      }
      maCarte.addLayer(vector)
    }

  })
  

 // Zoom to Point
 $(document).ready(function(){
  $(document).on('change','select',function(e){
    var layers = maCarte.getLayers();
    console.log(e.target.selectedOptions[0].value)
    layers.forEach((layer)=>{
      if(layer.get('title')=== e.target.id){
        layer.getSource().getFeatures().forEach((feat)=>{
          if(feat.get('id') === e.target.selectedOptions[0].value){
            maCarte.getView().animate({center:feat.getGeometry().getCoordinates(),zoom:13, duration: 2000 })
          }
        })
      }
    })
  })
})








