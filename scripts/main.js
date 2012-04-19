//main.js

(function($)
{
  var Renderer = function(canvas)
  {
    var canvas = $(canvas).get(0);
    var ctx = canvas.getContext("2d");
    var particleSystem
    
    var that = {
      init:function(system)
      {
        particleSystem = system
        
        particleSystem.screenSize(canvas.width, canvas.height)
        particleSystem.screenPadding(80)
        
        that.initMouseHandling()
        
      },
      
      redraw:function(){
        ctx.fillStyle = "white"
        ctx.fillRect(0,0,canvas.width, canvas.height)
        
        particleSystem.eachEdge(function(edge,p1,p2){
          ctx.strokeStyle = "rgba(0,0,0,.333)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pt1.x,p1.y)
          ctx.lineTo(pt2.x,pt2.y)
          ctx.stroke()
        })
        
        particleSystem.eachNode(function(node, pt){
          var w = 10
          ctx.fillStyle = (node.data.alone) ? "orange" : "black"
          ctx.fillRect(pt.x - w/2, pt.y - w/2, w,w)
        })
      }
    }
    return that
  }
})