 // settings for anchor points around an object
var AnchorSettings = {
      circleRadius: 4,
      strokeWidth: 2,
      stroke: "#666",
      fill: "#ddd",
      dragThreshold: 5 // max drag threshold
};
 
 
// rearrange the anchors position if the text size change
function rePositionAnchors( group, layer , x ,y , width, height, widgetObj ){
    var topLeft = group.get(".topLeft")[0];
    var topRight = group.get(".topRight")[0];
    var bottomRight = group.get(".bottomRight")[0];
    var bottomLeft = group.get(".bottomLeft")[0];
    
    var midTop = group.get(".midTop")[0];
    var midLeft = group.get(".midLeft")[0];
    var midRight = group.get(".midRight")[0];
    var midBtm = group.get(".midBtm")[0];
    
    var rect =  group.get(".rect")[0];
    var offset = AnchorSettings.circleRadius;
    
    
    if(widgetObj instanceof Kinetic.Text)
    {
        layer.draw();
         
        // for text must recalculate the width , height
        width = widgetObj.getTextWidth();
        height = widgetObj.getTextHeight();
        
        // for text, x & y are the center point
        // need to reset the x,y position
        x = x - width/2;
        y = y - height/2; 
    }
    
    topLeft.attrs.x = x;
    topLeft.attrs.y = y;
    
    topRight.attrs.x = x + width;
    topRight.attrs.y = y;
    
    bottomRight.attrs.x = x + width;
    bottomRight.attrs.y = y + height;
    
    bottomLeft.attrs.x = x ;
    bottomLeft.attrs.y = y + height;
    
    // recalculate mid point    
    midTop.attrs.y = topRight.attrs.y - offset;
    midTop.attrs.x = (topLeft.attrs.x + topRight.attrs.x)/2 - offset;
    
    midLeft.attrs.y = (topLeft.attrs.y + bottomLeft.attrs.y )/2 - offset;
    midLeft.attrs.x = topLeft.attrs.x - offset;
    
    midRight.attrs.y = (topLeft.attrs.y + bottomLeft.attrs.y )/2 - offset;
    midRight.attrs.x = topRight.attrs.x - offset;
    
    midBtm.attrs.y = bottomRight.attrs.y - offset;
    midBtm.attrs.x = (topLeft.attrs.x + topRight.attrs.x)/2 - offset;
    
    // recalculate position for highlight rect
    rect.setPosition(topLeft.attrs.x - (AnchorSettings.strokeWidth/2), topLeft.attrs.y - (AnchorSettings.strokeWidth/2) );
    rect.setSize(topRight.attrs.x - topLeft.attrs.x + AnchorSettings.strokeWidth, bottomLeft.attrs.y - topLeft.attrs.y + AnchorSettings.strokeWidth);
    
    
    
    
}
  
// resetup anchors events
function resetupAnchorEvents(anchorGroup){
      
    //console.log("setup anchor events here");

    var topLeft = anchorGroup.get(".topLeft")[0];
    var topRight = anchorGroup.get(".topRight")[0];
    var bottomRight = anchorGroup.get(".bottomRight")[0];
    var bottomLeft = anchorGroup.get(".bottomLeft")[0];
    
    var midTop = anchorGroup.get(".midTop")[0];
    var midLeft = anchorGroup.get(".midLeft")[0];
    var midRight = anchorGroup.get(".midRight")[0];
    var midBtm = anchorGroup.get(".midBtm")[0];
      
    
    var group = anchorGroup.getParent();
    var curWidget = group.children[0]; // the cur widget is the first child
    
    //console.log("parent name : " + parent.attrs.name + ", instance " + (parent instanceof Kinetic.Group) );
    
    setupAnchorEvents(group, topLeft , curWidget);
    setupAnchorEvents(group, topRight , curWidget);
    setupAnchorEvents(group, bottomRight , curWidget);
    setupAnchorEvents(group, bottomLeft , curWidget);
    
    setupAnchorEvents(group, midTop , curWidget);
    setupAnchorEvents(group, midLeft , curWidget);
    setupAnchorEvents(group, midRight , curWidget);
    setupAnchorEvents(group, midBtm , curWidget);
  
}
// resize elements based on dragging
// reposition the anchors also
function updateAnchor(group, activeAnchor , curWidget)
{
    //console.log("===========update anchor");
    
    var topLeft = group.get(".topLeft")[0];
    var topRight = group.get(".topRight")[0];
    var bottomRight = group.get(".bottomRight")[0];
    var bottomLeft = group.get(".bottomLeft")[0];
    
    var midTop = group.get(".midTop")[0];
    var midLeft = group.get(".midLeft")[0];
    var midRight = group.get(".midRight")[0];
    var midBtm = group.get(".midBtm")[0];
    
    var rect =  group.get(".rect")[0];

    var offset = AnchorSettings.circleRadius;
    var isText = curWidget instanceof Kinetic.Text;
    var isCircle = curWidget instanceof Kinetic.Circle;
    
    // if is text must increase the font size only
    
    // update anchor positions
    switch (activeAnchor.getName()) {
        case "topLeft":
            // if anchor is below bottom right, then stop immediately
            if(activeAnchor.attrs.x + AnchorSettings.dragThreshold >= bottomRight.attrs.x)
                activeAnchor.attrs.x = bottomRight.attrs.x - AnchorSettings.dragThreshold;
            
            if(activeAnchor.attrs.y + AnchorSettings.dragThreshold >= bottomRight.attrs.y)
                activeAnchor.attrs.y = bottomRight.attrs.y - AnchorSettings.dragThreshold;
        
            topRight.attrs.y = activeAnchor.attrs.y;
            bottomLeft.attrs.x = activeAnchor.attrs.x;
            
            break;
        case "topRight":
            
            // prevent dragging below certain limit
            if(activeAnchor.attrs.x - AnchorSettings.dragThreshold <= bottomLeft.attrs.x)
                activeAnchor.attrs.x = bottomLeft.attrs.x + AnchorSettings.dragThreshold;
            
            if(activeAnchor.attrs.y + AnchorSettings.dragThreshold >= bottomLeft.attrs.y)
                activeAnchor.attrs.y = bottomLeft.attrs.y - AnchorSettings.dragThreshold;
        
            topLeft.attrs.y = activeAnchor.attrs.y;
            bottomRight.attrs.x = activeAnchor.attrs.x;
             
            break;
        case "bottomRight":
            // prevent dragging below certain limit
            if(activeAnchor.attrs.x - AnchorSettings.dragThreshold <= topLeft.attrs.x)
                activeAnchor.attrs.x = topLeft.attrs.x + AnchorSettings.dragThreshold;
            
            if(activeAnchor.attrs.y - AnchorSettings.dragThreshold <= topLeft.attrs.y)
                activeAnchor.attrs.y = topLeft.attrs.y + AnchorSettings.dragThreshold;
        
            bottomLeft.attrs.y = activeAnchor.attrs.y;
            topRight.attrs.x = activeAnchor.attrs.x;
            
           
            break;
        case "bottomLeft":
            
            if(activeAnchor.attrs.x + AnchorSettings.dragThreshold >= topRight.attrs.x)
                activeAnchor.attrs.x = topRight.attrs.x - AnchorSettings.dragThreshold;
            
            if(activeAnchor.attrs.y - AnchorSettings.dragThreshold <= topRight.attrs.y)
                activeAnchor.attrs.y = topRight.attrs.y + AnchorSettings.dragThreshold;
            
            bottomRight.attrs.y = activeAnchor.attrs.y;
            topLeft.attrs.x = activeAnchor.attrs.x;
            
            break;
        
        case "midTop":
            
            if(activeAnchor.attrs.y + AnchorSettings.dragThreshold >= midBtm.attrs.y)
                activeAnchor.attrs.y = midBtm.attrs.y - AnchorSettings.dragThreshold;
            
            topRight.attrs.y = activeAnchor.attrs.y + offset;
            topLeft.attrs.y = activeAnchor.attrs.y + offset;
            break;
        
        case "midLeft":
            
            if(activeAnchor.attrs.x + AnchorSettings.dragThreshold >= midRight.attrs.x)
                activeAnchor.attrs.x = midRight.attrs.x - AnchorSettings.dragThreshold;
            
            bottomLeft.attrs.x = activeAnchor.attrs.x + offset;
            topLeft.attrs.x = activeAnchor.attrs.x + offset;
            
            break;
        
        case "midRight":
            if(activeAnchor.attrs.x - AnchorSettings.dragThreshold <= midLeft.attrs.x)
                activeAnchor.attrs.x = midLeft.attrs.x + AnchorSettings.dragThreshold;
           
            bottomRight.attrs.x = activeAnchor.attrs.x + offset;
            topRight.attrs.x = activeAnchor.attrs.x + offset;
            break;
        
        case "midBtm":
            if(activeAnchor.attrs.y - AnchorSettings.dragThreshold <= midTop.attrs.y)
                activeAnchor.attrs.y = midTop.attrs.y + AnchorSettings.dragThreshold;
            
            bottomRight.attrs.y = activeAnchor.attrs.y + offset;
            bottomLeft.attrs.y = activeAnchor.attrs.y + offset;
            break;
        
    }
    
    // recalculate position for mid points
    midTop.attrs.y = topRight.attrs.y - offset;
    midTop.attrs.x = (topLeft.attrs.x + topRight.attrs.x)/2 - offset;
    
    midLeft.attrs.y = (topLeft.attrs.y + bottomLeft.attrs.y )/2 - offset;
    midLeft.attrs.x = topLeft.attrs.x - offset;
    
    midRight.attrs.y = (topLeft.attrs.y + bottomLeft.attrs.y )/2 - offset;
    midRight.attrs.x = topRight.attrs.x - offset;
    
    midBtm.attrs.y = bottomRight.attrs.y - offset;
    midBtm.attrs.x = (topLeft.attrs.x + topRight.attrs.x)/2 - offset;
    
    // recalculate position for highlight rect
    rect.setPosition(topLeft.attrs.x - (AnchorSettings.strokeWidth/2), topLeft.attrs.y - (AnchorSettings.strokeWidth/2) );
    rect.setSize(topRight.attrs.x - topLeft.attrs.x + AnchorSettings.strokeWidth, bottomLeft.attrs.y - topLeft.attrs.y + AnchorSettings.strokeWidth);
    
    if(isText)
    {
        // resize the font size accordingly
        var oldFontSize = curWidget.getFontSize();
        var ratio = 1;
        
        var anchorName = activeAnchor.getName();

        if(anchorName == "midBtm" || anchorName == "midTop")
        {
            var height = curWidget.getTextHeight();
            ratio = (bottomLeft.attrs.y - topLeft.attrs.y) / height;
        
        }
        else
        {
            var width = curWidget.getTextWidth();
            ratio = (topRight.attrs.x - topLeft.attrs.x) / width;
        }
        //console.log("ratio " + ratio);
        
        var newFontSize = parseInt(ratio * oldFontSize);
        if(newFontSize < 1)
            newFontSize = 1;
            
        //console.log("newFontSize " + newFontSize );
        curWidget.setFontSize( newFontSize );
        
        // for text, x & y are the center point

        // text position is the center point
        curWidget.setPosition( (topLeft.attrs.x + topRight.attrs.x)/2, (topLeft.attrs.y + bottomLeft.attrs.y)/2 );
        
        setFontSizeBox(newFontSize); // update the font size box if there is only 1 active element
        
    }
    else if(isCircle)
    { 
        var newRadius = parseInt( (topRight.attrs.x - topLeft.attrs.x) / 2 );
        
        if(newRadius < 1)
            newRadius = 1;
        
        curWidget.setPosition( (topLeft.attrs.x + topRight.attrs.x)/2, (topLeft.attrs.y + bottomLeft.attrs.y)/2 );
        curWidget.setRadius(newRadius);
    }
    else
    {
        // reposition & resize the widget
        curWidget.setPosition(topLeft.attrs.x, topLeft.attrs.y);
        if(curWidget.setSize)
            curWidget.setSize(topRight.attrs.x - topLeft.attrs.x, bottomLeft.attrs.y - topLeft.attrs.y);
        else
        {
            curWidget.attrs.width = topRight.attrs.x - topLeft.attrs.x;
            curWidget.attrs.height = bottomLeft.attrs.y - topLeft.attrs.y;
        }
    }
    
}

function setupAnchorEvents(group, anchor , curWidget){

    var anchorGroup = group.get('.anchorGroup')[0];
    
    // resize widget based by dragging anchor
    anchor.on("dragmove", function() {
        //console.log("anchor drag move");
        var layer = this.getLayer();
        updateAnchor(anchorGroup, this, curWidget);
        layer.draw();
    });
    
    // disable dragging upon clicking of anchor
    anchor.on("mousedown touchstart", function() {
        //console.log("anchor mouse down");
        
        group.draggable(false);
        anchorGroup.draggable(false);
        
        this.moveToTop();
    });
    
    anchor.on("dragend", function() {
        //console.log("anchor drag end");
        var layer = this.getLayer();
        group.draggable(true);
        anchorGroup.draggable(true);
        layer.draw();
    });
    
    // add hover styling
    anchor.on("mouseover", function() {
        var layer = this.getLayer();
        document.body.style.cursor = "pointer";
        this.setStrokeWidth(4);
        layer.draw();
    });
    
    anchor.on("mouseout", function() {
        var layer = this.getLayer();
        document.body.style.cursor = "default";
        this.setStrokeWidth(2);
        layer.draw();
    });
}

function addAnchor(group, x, y, name , curWidget) {
    var stage = group.getStage();
    var layer = group.getLayer();

    var anchorGroup = group.get('.anchorGroup')[0];
    
    var anchor;
    
    // draw circle for 4 corners
    // draw rect for 4 middle points
    
    var circleRadius = AnchorSettings.circleRadius;
    var strokeWidth = AnchorSettings.strokeWidth;
    var stroke = AnchorSettings.stroke;
    var fill = AnchorSettings.fill ;
    
    if( (name == "topLeft") || (name == "topRight") || (name == "bottomRight") || (name == "bottomLeft") )
    {
    
        anchor = new Kinetic.Circle({
            x: x,
            y: y,
            stroke: stroke,
            fill: fill,
            strokeWidth: strokeWidth,
            radius: circleRadius,
            name: name,
            draggable: true
        });
    }
    else
    {
        anchor = new Kinetic.Rect({
            x :  x,
            y :  y,
            width: (circleRadius * 2 ),
            height: (circleRadius * 2 ),
            stroke: stroke,
            fill: fill,
            strokeWidth: 2,
            draggable: true,
            name: name 
        });
    }
    
    setupAnchorEvents(group, anchor , curWidget);
    
    // hide all mid points for text and circle
    if(curWidget instanceof Kinetic.Text || curWidget instanceof Kinetic.Circle)
    {
        // if is text element then hide the middle point anchors
        if(name.indexOf("mid") > -1)
        {
            anchor.attrs.visible = false;
        }
    }

    anchorGroup.add(anchor);
}


// add the resize anchors and highlight rect to the cur element
// x, y, width , height is the x y , width height of the cur element
function addAnchors( group, layer , x ,y , width, height, curWidget ){
    var anchorGroup = new Kinetic.Group({
        draggable: true,
        name: "anchorGroup"
    });
    
    group.add(anchorGroup);
    
    // this rect is used for selection
    var rect = new Kinetic.Rect({
        x :  x - (AnchorSettings.strokeWidth/2),
        y :  y - (AnchorSettings.strokeWidth/2),
        width: width + AnchorSettings.strokeWidth,
        height: height + AnchorSettings.strokeWidth,
        stroke: AnchorSettings.stroke,
        strokeWidth: AnchorSettings.strokeWidth,
        draggable: true,
        visible: true,
        name: "rect" // boundary rect
    });
    
    // add boundary rectangle
    anchorGroup.add(rect);
    
    // add corner anchors
    addAnchor(group, x, y, "topLeft" , curWidget);
    addAnchor(group, x + width, y, "topRight" , curWidget);
    addAnchor(group, x + width, y + height, "bottomRight" , curWidget);
    addAnchor(group, x, y + height, "bottomLeft" , curWidget);
    
    // add middle points
    var offset = AnchorSettings.circleRadius;
    addAnchor(group, x + (width/2.0) - offset , y - offset, "midTop" , curWidget);
    addAnchor(group, x - offset, y + (height/2.0) - offset, "midLeft" , curWidget);
    addAnchor(group, x + width - offset, y + (height/2.0) - offset, "midRight" , curWidget);
    addAnchor(group, x + (width/2.0) - offset, y + height - offset, "midBtm" , curWidget);
    
}

