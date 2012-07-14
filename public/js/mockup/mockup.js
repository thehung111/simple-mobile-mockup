 
// storing the current active element
var MyApp = {
    lastDragPosition: {x:0,y:0}, // storing last drag position
    isShiftKeyPressed: false,
    bottomLayerIndex: -1, // index of bottom element in the layer
    insideDrawingArea: false, // whether inside the drawing area
    activeElements: [], // array contain of currently active elements
    layer: null,
    stage: null,
    drawRoundRect: function() {
                          
            var ctx = this.getContext();
            var radius = 10;
            
            var x = 0;
            var y = 0;
            
            var width = this.attrs.width;
            var height = this.attrs.height;
     
            ctx.beginPath();
            this.applyLineJoin();
            
            // note: somehow the context begin from relative positon, not the absolute x, y position
            
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            
            this.fillStroke();
            //console.dir(this);
    },                    
    loadStage: function(json) {
            var curStage = MyApp.stage;
            if(curStage == null)
                    return;
            curStage.clear();
            curStage.reset();

            function loadNode(node, obj) {
                    var objName = undefined;
                    if(obj.attrs)
                        objName = obj.attrs.name;
                    
                    //console.log("objname: " + objName);
                    
                    var children = obj.children;
                    if(children !== undefined) {
                        for(var n = 0; n < children.length; n++) {
                            var child = children[n];
                            var type;
                            var widgetType;
                            var childName = child.attrs.name;
            
                            // determine type
                            if(child.nodeType === 'Shape') {
                                // add custom shape
                                if(child.shapeType === undefined) {
                                    type = 'Shape';
                                }
                                // add standard shape
                                else {
                                    type = child.shapeType;
                                }
                            }
                            else {
                                type = child.nodeType;
                            }
                            
                            
                            //console.log("child " + n + ", type is : " + type + " , name is : " + childName);
                            
                            // need to add in the highlight rect 
                            
                            if(type == "Image")
                            {
                                    //console.dir(child.attrs);
                                    // set the image src for this
                                    var imageObj = new Image();
                                    imageObj.src = child.attrs.imgSrc;
                                    child.attrs.image = imageObj;
                                    
                                    widgetType = "image";
                                    
                                    // set up the event
                                    /*if(obj.attrs.name == "mainGroup" )
                                    {
                                           //setupGroupEvents(no); 
                                    }*/
                            }
                            else if(type =="Shape"){
                                    //console.dir(child.attrs);
                                    if(child.attrs.name == "roundRect" )
                                    {
                                            // round rect
                                            child.attrs.drawFunc = MyApp.drawRoundRect;
                                            widgetType = "roundrect";
                                    }
                            }
                            else if(type == "Circle")
                            {
                                    widgetType = "circle";
                            }
                            else if(type == "Text"){
                                    widgetType = "text";
                            }
                            else if(type == "Rect"){
                                    widgetType = "rect";
                            }
                            
                            
                            
                            // set up the anchors for rect
                            //setupWidget(widgetType, layer, rect, mouseX, mouseY,  initWidth, initHeight);
                            // must re-setup all the events and clicks
                            
                            
                            var no = new Kinetic[type](child.attrs);
                            node.add(no);
                            
                            // set up group dragging , click events
                            if(objName == "mainGroup")
                            {
                                    //console.dir(obj);
                                    if(childName == "anchorGroup")
                                    {
                                            // setup anchor group events
                                            no.attrs.visible = false;
                                    }
                                    else
                                    {
                                            setupGroupEvents(widgetType, no, node);
                               
                                    }
                            }
                                    
                            if(type=="Layer"){
                                    MyApp.layer = no;
                            }
            
                            loadNode(no, child);
                        }
                        
                        if(objName == "anchorGroup")
                        {
                            // setup anchor group events
                    
                            var anchorGroup = node;
                            resetupAnchorEvents(node);
                        }
                        //console.log("===============");
                    }
            }
            var obj = JSON.parse(json);
    
            // copy over stage properties
            curStage.attrs = obj.attrs;
    
            loadNode(curStage, obj);
            curStage.draw();
            
            MyApp.stage = curStage;
            
            
            MyApp.clearActiveElements(true);
            
            setTimeout( function(){
                    MyApp.layer.draw();
            },500);
    },
    clearActiveElements: function(callDraw){ // whether to call the draw function
        
        if(MyApp.isShiftKeyPressed) // if shift key being pressed, then dun do anything
        {
            return;
        }
        
        
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                
                // if an element is currently active, then clear its highlight rect first
                var curActiveAnchor = curElement.get('.anchorGroup')[0];
                if(curActiveAnchor)
                {
                    curActiveAnchor.attrs.visible = false; 
                    //console.log("clear active element " + (i+1) );
                }
            }
            
            MyApp.activeElements.length = 0; // empty the active elements array
            
            if(callDraw)
                MyApp.layer.draw();
        }
                    
    },
    getCurActiveObj: function(){
        var curObj = undefined;
        
        if(MyApp.activeElements.length == 1)
        {
            var cur = MyApp.activeElements[0];
            
            if(cur.get('.myrect').length > 0 ) // element is rect
            {
                curObj = cur.get('.myrect')[0];
            }
            //setStroke
            else if(cur.get('.roundRect').length > 0 ) // element is rect
            {
                curObj = cur.get('.roundRect')[0];
            }
            else if(cur.get('.img').length > 0 ) // image
            {
                curObj = cur.get('.img')[0];
            }
            //mycircle
            else if(cur.get('.mycircle').length > 0 ) // image
            {
                curObj = cur.get('.mycircle')[0];
            }
             
        }
        return curObj;
    },
    /* command buttons */
    moveToTop: function(){ // move cur active element to top 
        if(MyApp.activeElements.length > 0 )
        {
            // go through list of elements
            // then move them to the same layer as the first one
            var firstElement = MyApp.activeElements[0];
            firstElement.moveToTop();
            
            var topIndex = firstElement.getZIndex();
            
            for(var i = 1 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                curElement.setZIndex(topIndex); // move all the elements to the top layer
            }
            
            MyApp.layer.draw();
        }
    },
    moveToBottom: function(){ // move cur active element to bottom 
        //console.log("move bottom event");
        
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                var zindex = curElement.getZIndex();
                
                if(zindex > MyApp.bottomLayerIndex + 2) // only move down if above bottom layer (iphone)
                    curElement.setZIndex(MyApp.bottomLayerIndex + 2); // move to be above the iphone background image
            }
            
            MyApp.layer.draw();
        }

    },
    moveUp: function(){
        
        if(MyApp.activeElements.length > 0 )
        {
            // go through list of elements
            // then move them to the same layer as the first one
            var firstElement = MyApp.activeElements[0];
            firstElement.moveUp();
            
            var zindex = firstElement.getZIndex();
            
            for(var i = 1 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                curElement.setZIndex(zindex); // move all the elements same layer as first element
            }
            
            MyApp.layer.draw();
        }
        
    },
    moveDown: function(){
        
        if(MyApp.activeElements.length > 0 )
        {
            // go through list of elements
            // then move them to the same layer as the first one
            var firstElement = MyApp.activeElements[0];
            var zindex = firstElement.getZIndex();
            
            if(zindex > MyApp.bottomLayerIndex + 2) // only move down if at bottom layer
                firstElement.moveDown();
            
            zindex = firstElement.getZIndex();
            
            for(var i = 1 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                curElement.setZIndex(zindex); // move all the elements same layer as first element
            }
            
            MyApp.layer.draw();
        }
    
    },
    /* keyboard events */
    delKeyPress: function(){ // delete key
        console.log('delete key pressed');
        
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                MyApp.layer.remove(curElement);
            }
            MyApp.activeElements.length = 0; // clear the active elements
            MyApp.layer.draw();
        }
        
        checkPropertyPanel();
        
        return false; // prevent  the event from bubling up to the browser
    },
    upKeyPress: function(){ // up arrow key
        console.log('arrow up key pressed');
        
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                curElement.setY(curElement.attrs.y - 1);
            }
            MyApp.layer.draw();
        }
        
        return false; // prevent  the event from bubling up to the browser
    },
    downKeyPress: function(){ // up arrow key
        console.log('arrow down key pressed');
        
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                curElement.setY(curElement.attrs.y + 1);
            }
            MyApp.layer.draw();
        }
                
        return false; // prevent  the event from bubling up to the browser
    },
    leftKeyPress: function(){ // up arrow key
        console.log('arrow left key pressed');
        
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                curElement.setX(curElement.attrs.x - 1);
            }
            MyApp.layer.draw();
        }
                    
        return false; // prevent  the event from bubling up to the browser
    },
    rightKeyPress: function(){ // up arrow key
        console.log('arrow right key pressed');
        
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                curElement.setX(curElement.attrs.x + 1);
            }
            MyApp.layer.draw();
        }
         
        return false; // prevent  the event from bubling up to the browser
    },
    shiftKeyPress: function(){
        MyApp.isShiftKeyPressed = true;
        console.log("shift pressed");
    },
    shiftKeyUp: function(){
        MyApp.isShiftKeyPressed = false;
        console.log("shift release");
    },
    copyCmd: function(){
        alert("Ctrl C");
        
        // copy all the current active elements and add them to the stage
        if(MyApp.activeElements.length > 0 )
        {
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var curElement = MyApp.activeElements[i];
                // clone this element, but shift them to the right
                
            }
            MyApp.layer.draw();
        }
        
    },
    pasteCmd: function(){
        alert("Ctrl V");
    },
    undoCmd: function(){
        alert("Ctrl Z");
    },
    redoCmd: function(){
        alert("Ctrl Y");
    }
};

function setupColorPicker()
{
    // fill color
    $('#colorSelector').ColorPicker({
        color: '#0000ff',
        onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            var colorStr = '#' + hex;
            setColorDiv(colorStr);
            
            // check whether there is only 1 active element, change accordingly
            if(MyApp.activeElements.length == 1)
            {
                var curObj = MyApp.getCurActiveObj();
                if(curObj)
                {
                    curObj.setFill(colorStr);    
                    MyApp.layer.draw();
                }
            }
        }
    });
    
    // stroke color
    $('#strokeSelector').ColorPicker({
        color: '#0000ff',
        onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            var colorStr = '#' + hex;
            setStrokeColorDiv(colorStr);
            
            // check whether there is only 1 active element, change accordingly
            if(MyApp.activeElements.length == 1)
            {
                var curObj = MyApp.getCurActiveObj();
                if(curObj)
                {
                    curObj.setStroke(colorStr);    
                    MyApp.layer.draw();
                    //console.log("stroke draw");
                }
                else{
                    //console.log("no active object");
                }
            }
            else{
                 //console.log("more than 1 active object");   
            }
        }
    });
    
    
}


// if there is only 1 active element , then open the panel
// otherwise hide the panel
function checkPropertyPanel()
{
    //console.log("chekck property panel : " + MyApp.activeElements.length);
    if(MyApp.activeElements.length == 1)
    {
        //.commonProperties .others
        $('#propertyPanel').show();
        
        // if the cur element is text, then show other panel
        var cur = MyApp.activeElements[0];
        if(cur.get('.mytext').length > 0 ) // text div
        {
            $('.commonProperties .others').hide();
            $('.textProperties').show();
        }
        else{
            $('.commonProperties .others').show();
            $('.textProperties').hide();
            
            if(cur.get('.img').length > 0) // if image then hide the fill panel
            {
                $('.commonProperties .fillcolor').hide();
            }
            else
            {
                $('.commonProperties .fillcolor').show();
            }
        }
    }
    else
        $('#propertyPanel').hide();
    
}

function setColorPicker(colorString)
{
    setColorDiv(colorString);
    $('#colorSelector').ColorPickerSetColor(colorString);
}

function setStrokeColorPicker(colorString)
{
    setStrokeColorDiv(colorString);
    $('#strokeSelector').ColorPickerSetColor(colorString);
}

function setStrokeColorDiv(colorString)
{
    $('#strokeSelector div').css('backgroundColor', colorString);
}

function setColorDiv(colorString)
{
    $('#colorSelector div').css('backgroundColor', colorString);
}

function setText(newText)
{
    if(MyApp.activeElements.length == 1)
        $('#textInput').val(newText);
}

function setFontSizeBox(newSize)
{
    if(MyApp.activeElements.length == 1)
        $('#fontSizeInput').val(newSize);
}

function setFontBox(newFont)
{
    if(MyApp.activeElements.length == 1)
        $('#fontInput').val(newFont);
    
}

function setTextProperties(widgetObj)
{
    if(MyApp.activeElements.length == 1)
    {
        setColorPicker(widgetObj.getTextFill() );
        setText(widgetObj.getText() );
        setFontSizeBox(widgetObj.getFontSize() );
        setFontBox(widgetObj.getFontFamily() );
    }
}


function setupStrokeThicknessProperty()
{
    $('#strokeWidthThickness').change(function(){
        if(MyApp.activeElements.length == 1)
        {
            var newWidthVal = $('#strokeWidthThickness').val();
            var curObj = MyApp.getCurActiveObj();
            
            if(curObj)
            {
                if(newWidthVal < 1)
                {
                    curObj.attrs.strokeWidth = undefined;
                    curObj.attrs.stroke = undefined;
                }
                else
                    curObj.setStrokeWidth(newWidthVal);
                
                MyApp.layer.draw();
            }
            
        }
        
    });
}

function setPropertiesBox(widgetType, widgetObj)
{
    if(widgetType == "rect" || widgetType == "roundrect")
    {
        // set colors and stroke width
        if(widgetObj.getFill())
            setColorPicker(widgetObj.getFill() );
        else
            setColorPicker("white");
    }
   
    // set stroke if there is any
    if(widgetObj.attrs.strokeWidth )
    {
        $('#strokeWidthThickness').val( widgetObj.getStrokeWidth() );
        
        if(widgetObj.getStroke() )
            setStrokeColorPicker(widgetObj.getStroke() );
    }
    else{
        $('#strokeWidthThickness').val(0);
        setStrokeColorPicker("white");
    }
}

function setupTextProperties()
{
    $('#fontInput').change(function(){
        if(MyApp.activeElements.length == 1)
        {
            var newFont = $('#fontInput').val()  ;
            var cur = MyApp.activeElements[0];
            if(cur.get('.mytext').length > 0 )
            {
                var textEl = cur.get('.mytext')[0];
                textEl.setFontFamily( newFont );
                        
                rePositionAnchors( cur, MyApp.layer , textEl.attrs.x , textEl.attrs.y , 0, 0, textEl );
                        
                // need to refresh the anchor
                MyApp.layer.draw();
            }
        }
        
    });
    
    $('#fontSizeInput').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') // user press enter
        {
            if(MyApp.activeElements.length == 1) // if there is only 1 active element
            {
                var cur = MyApp.activeElements[0];
                if(cur.get('.mytext').length > 0 )
                {
                    var fontSizeVal = $.trim( $('#fontSizeInput').val() );
                    
                    if( fontSizeVal.length > 0  )
                    {
                        var newFontsize = parseInt(fontSizeVal,10);
                    
                        if(isNaN(newFontsize) || (newFontsize!=fontSizeVal) )
                        {
                            alert("Please enter a number.");
                        }
                        else{
                            if(newFontsize < 1 || newFontsize > 99)
                            {
                                alert("Invalid font size.");
                            }
                            else 
                            {
                                var textEl = cur.get('.mytext')[0];
                                textEl.setFontSize( newFontsize );
                        
                                rePositionAnchors( cur, MyApp.layer , textEl.attrs.x , textEl.attrs.y , 0, 0, textEl );
                        
                                 // need to refresh the anchor
                                MyApp.layer.draw();
                            }
                        }
                    }
                    else
                    {
                        alert("Please enter a number.");
                    }
                }
            }
        }
    
    });
    
    
    $('#textInput').keypress(function(event){
        if(MyApp.activeElements.length == 1) // if there is only 1 active element
        {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13')
            {
                 
                var cur = MyApp.activeElements[0];
                if(cur.get('.mytext').length > 0 )
                {
                    var textVal = $.trim( $('#textInput').val() );
                    
                    if(textVal.length > 0)
                    {
                        // text element
                        var textEl = cur.get('.mytext')[0];
                        
                        // set the text
                        // reposition all the anchors
                        textEl.setText( textVal );
                        
                        rePositionAnchors( cur, MyApp.layer , textEl.attrs.x , textEl.attrs.y , 0, 0, textEl );
                        
                        // need to refresh the anchor
                        MyApp.layer.draw();
                    }
                    else{
                        alert("Please enter text");
                    }
                    
                }
                 
            }
        }
       
        
    });
}


$(document).ready(function() {
    
    //console.log("isMobile " + isMobile() );
    
    initTouch();
    
    window.onbeforeunload = function() {
            
            return "You have unsaved changes, do you want to leave?";
    };

    
    setupTextProperties();
    
    setupColorPicker();
    setupStrokeThicknessProperty();
    
    // init the stage and layer
    var stage = new Kinetic.Stage({
        container: "drawingArea",
        width: 460,
        height: 800
    });
    
    var layer = new Kinetic.Layer();
    
    MyApp.stage = stage;
    MyApp.layer = layer;
    
    // add the layer to the stage
    stage.add(layer);
    
    //initBgContainer();
    
    // add the iphone container
    
    var widgetSetType = $('#widgetSelector').val();
    initBgContainer(widgetSetType);
    
    // add widget areas
    loadWidgets(widgetSetType);
    
    initControlPanel();
    
    setupKeyClick(); // setup keyboard clicks
    
    checkPropertyPanel();
    
    // init widget selector
    $('#widgetSelector').change(function(){
            var widgetSetType = $(this).val();
            initBgContainer(widgetSetType);
            loadWidgets(widgetSetType);
    });
     
    $('#drawingArea').bind('click touchstart', function(e){
        //console.log("drawing area click");
        
        if(MyApp.isShiftKeyPressed) // if shift key being pressed, then dun do anything
        {
            return;
        }
        
        //console.log("is dragging " + MyApp.stage.isDragging() );
        
        // if no active element then stop processing
        if(MyApp.activeElements.length == 0 )
            return;
        
        /*var drawingAreaOffset = $('#drawingArea').offset();
            
        // get the current mouse position , check whether it is within the current active element bound
        // if it is not, clear the element
        var x;
        var y;
        
        if (e.pageX || e.pageY) { 
          x = e.pageX;
          y = e.pageY;
        }
        else { 
          x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
          y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
        } 
        x -= drawingAreaOffset.left;
        y -= drawingAreaOffset.top;
        */
        
        // get cur mous position
        var pos = MyApp.stage.getUserPosition();
        var x = pos.x;
        var y = pos.y;
        
        //console.log("stage user pos " + pos.x + " , y = " + pos.y);
        
        var clickOnActiveElement = false;

        //console.log("MyApp.activeElements.length " + MyApp.activeElements.length);
        // clear the highlight rect if out of range
        for(var i = 0 ; i < MyApp.activeElements.length ; i++)
        {
            var curElement = MyApp.activeElements[i];
           
            // if an element is currently active, then clear its highlight rect first
            var curActiveAnchor = curElement.get('.anchorGroup')[0];
            if(curActiveAnchor)
            {
                var curActiveRect = curActiveAnchor.get('.rect')[0];
                
                if(curActiveRect && curActiveRect.attrs)
                {
                    var position = curActiveRect.getAbsolutePosition();
                    var curActiceX = position.x;
                    var curActiveY = position.y;
                    //console.log("x = " + x + " , y =  " + y + ", curactive rec " + curActiceX + ", cur y " + curActiveY);
                    //console.log("width " + curActiveRect.attrs.width + ", height " + curActiveRect.attrs.height);
                    
                    if(  (x >= curActiceX) &&
                         (x <= curActiceX + curActiveRect.attrs.width + AnchorSettings.strokeWidth ) &&
                         (y >= curActiveY ) &&
                         (y <= curActiveY + curActiveRect.attrs.height + AnchorSettings.strokeWidth) 
                      )
                    {
                        // the click is within the current active element bounds
                        //console.log("click within the element");
                        clickOnActiveElement = true;
                        break;
                    }
                    
                    
                    
                }
            }
        }
        
        if(!clickOnActiveElement)
        {
            MyApp.clearActiveElements(true);
        }
        
        checkPropertyPanel();
        
    });
    
    
    
    // when image is dropped, get the position and then add it to canvas
    $('#drawingArea').droppable( {
        drop: function(event, ui){
            var layer = MyApp.layer;
            
            var draggable = ui.draggable; // the draggable refer to original drag item e.g. the image thumbnail
            //console.dir(draggable);
            //myWidget
            //console.log("class: " + draggable.attr('class') + " , hasClass : " + draggable.hasClass('widgetThumbnail') );
            var isImageWidget = draggable.hasClass('widgetThumbnail');
            var isDefaultWidget = draggable.hasClass('defaultWidget');
            
            if( (!isImageWidget) && (!isDefaultWidget) ) // only process element that is a widget
            {
                return;
            }
            
            var drawingAreaOffset = $('#drawingArea').offset();
            
            var offsetXPos = parseInt( ui.offset.left );
            var offsetYPos = parseInt( ui.offset.top );
            
            // get mouse position
            var mouseX = offsetXPos - drawingAreaOffset.left;
            var mouseY = offsetYPos - drawingAreaOffset.top;
                
            //console.log("offset x : " + offsetXPos + ", offset y " + offsetYPos);
            
            //console.log("drawing left : " + drawingAreaOffset.left + ", offset y " + drawingAreaOffset.top);
            if(isDefaultWidget)
            {
                var widgetType = draggable.attr('widgetType');
                
                //console.log("widget type: " + widgetType);
                
                if(widgetType=="text")
                {
                    var intitalText = "Some Text";
                    var initalColor = "black";
                    
                    // note: for text, x and y is the center point
                    var complexText = new Kinetic.Text({
                        x: mouseX,
                        y: mouseY,
                        text: intitalText,
                        fontSize: 20,
                        fontFamily: "Arial",
                        textFill: "black",
                        /*textStroke: "black",*/
                        align: "center",
                        verticalAlign: "middle",
                        fontStyle: "normal",
                        name: "mytext"
                    });
                    
                    // width and height will be retrieve later for text object
                    setupWidget(widgetType, layer, complexText, mouseX, mouseY,  0, 0 );
                    
                    // put the text in the property text boxs
                    setTextProperties(complexText);
                
                }
                else if(widgetType=="rect")
                {
                    var initWidth = 80;
                    var initHeight = 40;
                    var rect = new Kinetic.Rect({
                        x :  mouseX,
                        y :  mouseY,
                        width: initWidth,
                        height: initHeight,
                        stroke: "black",
                        strokeWidth: AnchorSettings.strokeWidth,
                        draggable: true,
                        visible: true,
                        name: "myrect"
                    });
                    
                    // width and height will be retrieve later for text object
                    setupWidget(widgetType, layer, rect, mouseX, mouseY,  initWidth, initHeight);
                    
                    setPropertiesBox(widgetType, rect);
                }
                else if(widgetType == 'roundrect')
                {
                    var initWidth = 240;
                    var initHeight = 40;
                    
                    var roundedRect = new Kinetic.Shape({
                        x :  mouseX,
                        y :  mouseY,
                        width: initWidth,
                        height: initHeight,
                        stroke: "black",
                        strokeWidth: AnchorSettings.strokeWidth,
                        draggable: true,
                        visible: true,
                        drawFunc: MyApp.drawRoundRect,
                        name: "roundRect"
                    });
                    setupWidget(widgetType, layer, roundedRect, mouseX, mouseY,  initWidth, initHeight);
                    setPropertiesBox(widgetType, roundedRect);
                }
                else if(widgetType == 'circle')
                {
                    var initialRadius = 40; 
                    var circle = new Kinetic.Circle({
                        x: mouseX,
                        y: mouseY,
                        radius: initialRadius,
                        stroke: "black",
                        strokeWidth: AnchorSettings.strokeWidth,
                        name: "mycircle"
                    });
                    setupWidget(widgetType, layer, circle , mouseX, mouseY,  initialRadius * 2, initialRadius * 2); 
                }
            }
            
            if(isImageWidget)
            {
                var imageObj = new Image();
                var imgSrc = draggable.attr('src');
                
                $(imageObj).load(function(){
                    //console.log('image loaded: ' + draggable.attr('src'));
                    var imageX = mouseX;
                    var imageY = mouseY;
                    
                    var image = new Kinetic.Image({
                        image: imageObj,
                        x :  imageX,
                        y :  imageY,
                        width: imageObj.width ,
                        height: imageObj.height ,
                        draggable: true,
                        name: "img"
                    });
                    
                    // extend image with source attribute to store image source
                    image.attrs.imgSrc = imgSrc;
                
                    setupWidget("image", layer, image, imageX, imageY,  imageObj.width, imageObj.height);
                    
                    setPropertiesBox("image", image);
                    
                    //alert( JSON.stringify(imageObj) );
                });
                
                imageObj.src = imgSrc;
            
            }
            
            checkPropertyPanel();
            
           
        }
    } );
    
});

// set up the button event
function initControlPanel(){
    $('#moveTopBtn').click(MyApp.moveToTop);
    $('#moveBottomBtn').click(MyApp.moveToBottom);
    $('#moveUpBtn').click(MyApp.moveUp);
    $('#moveDownBtn').click(MyApp.moveDown);
         

    $('#previewBtn').click(function(){
            // clear all active elements
            MyApp.clearActiveElements(true);
            
            MyApp.stage.toDataURL(function(dataUrl) {
                    // open link in a window
                    window.open(dataUrl);
            });
    });
    
    // new btn
    $('#newBtn').click(function(){
           MyApp.clearActiveElements(true);
           MyApp.stage.clear();
           MyApp.layer.removeChildren();
           
           var widgetSetType = $('#widgetSelector').val();
           initBgContainer(widgetSetType);
    });
    
    //saveBtn
    
    $('#saveBtn').click(function(){
            // clear all active elements
            MyApp.clearActiveElements(true);
            
            // save stage as a json string
            var json = MyApp.stage.toJSON();
            //alert(json);

            $("#saveJson").val(json);
            
            $( "#saveForm" ).dialog( "open" );
            
            // auto select all text for copying
            $("#saveJson").focus().select();
    });
    
    $( "#saveForm" ).dialog({
            autoOpen: false,
            height: 350,
            width: 500,
            modal: true,
            buttons: {
                    Ok: function() {
                            $( this ).dialog( "close" );
                    }
            }
    });
    
     $('#loadBtn').click(function(){
            // clear all active elements
            MyApp.clearActiveElements(true);
            
            $( "#loadForm" ).dialog( "open" );
    });
    
    $( "#loadForm" ).dialog({
            autoOpen: false,
            height: 350,
            width: 500,
            modal: true,
            buttons: {
                    "Load": function() {
                          
                          var val = $('#pasteJson').val();
                          if($.trim(val).length > 0)
                          {
                            MyApp.loadStage(val);
                            //MyApp.stage.load(val);
                            $( this ).dialog( "close" );
                          }
                          else{
                            alert('Please enter saved data');
                          }
                    }
                    ,Cancel: function() {
                            $( this ).dialog( "close" );
                    }
            }
    });
    
    
}

function initBgContainer(widgetSetType){
    if(widgetSetType=="iPhone")
            initContainer("/images/mockup/iphone/iPhone.png");
    else if(widgetSetType=="Android")
            initContainer("/images/mockup/eclair/samsung.png");
}

function initContainer( containerImgSrc){
    var stage = MyApp.stage;
    var layer = MyApp.layer;
    
    if(!layer)
            return;
    
    // find out if the cur background image is the same, if it is, then no need to do anything
    var curBgImg = layer.get('.backgroundImg');
    if(curBgImg.length > 0){
            //console.dir(curBgImg);
            if(curBgImg[0].getImage().src == containerImgSrc)
                    return;
    }
    
    var imageObj = new Image();
    $(imageObj).load( function() {
        //alert(stage.width) ;
        //console.dir(stage);
        
        
        if(curBgImg.length > 0){
            var image = curBgImg[0];
            image.setImage(imageObj);
            image.setWidth(imageObj.width);
            image.setHeight(imageObj.height);
            image.attrs.imgSrc = containerImgSrc;
            image.attrs.x = (stage.attrs.width - imageObj.width )/2;
            image.attrs.y = 0;
        }
        else
        {
            var image = new Kinetic.Image({
                    x: (stage.attrs.width - imageObj.width )/2,
                    y: 0,
                    image: imageObj,
                    name: "backgroundImg"
            });
            image.attrs.imgSrc = containerImgSrc;
            
            // add the shape to the layer
            layer.add(image);
            image.setZIndex(MyApp.bottomLayerIndex+1);
        }
        
        layer.draw();
        
    });
    imageObj.src = containerImgSrc;
    
    
}

function setupKeyClick(){
    
    $('#deleteBtn').bind('click', MyApp.delKeyPress);
    
    $(document).bind('keydown', 'del', MyApp.delKeyPress);
    $(document).bind('keydown', 'backspace', MyApp.delKeyPress); // in mac, delete key is actually backspace
    $(document).bind('keydown', 'up', MyApp.upKeyPress);
    $(document).bind('keydown', 'right', MyApp.rightKeyPress);
    $(document).bind('keydown', 'down', MyApp.downKeyPress);
    $(document).bind('keydown', 'left', MyApp.leftKeyPress);
    
    $(document).bind('keydown', 'Shift', MyApp.shiftKeyPress);
    $(document).bind('keyup', 'Shift', MyApp.shiftKeyUp);
    
    //copyCmd
    //$(document).bind('keydown', 'Ctrl+c', MyApp.copyCmd); // windows
    //$(document).bind('keydown', 'meta+c', MyApp.copyCmd); // macs
    //
    //$(document).bind('keydown', 'Ctrl+v', MyApp.pasteCmd); // windows
    //$(document).bind('keydown', 'meta+v', MyApp.pasteCmd); // macs
    
    //$(document).bind('keydown', 'Ctrl+z', MyApp.undoCmd); // windows
    //$(document).bind('keydown', 'meta+z', MyApp.undoCmd); // macs
    //
    //$(document).bind('keydown', 'Ctrl+y', MyApp.redoCmd); // windows
    //$(document).bind('keydown', 'meta+y', MyApp.redoCmd); // macs
    
    
}

function loadWidgets(widgetSetType){
    if(widgetSetType =="Android")
    {
            var imgFolderPrefix = "/images/mockup/eclair";
            var widgetArr = [
                      {title: "Android" , src:  "/icons/apps/android.png"} ,
                      {title: "Briefcase" , src: "/icons/apps/briefcase.png"},
                      {title: "Call" , src: "/icons/apps/call.png"},
                      {title: "Camera" , src: "/icons/apps/camera.png"},
                      {title: "Clock" , src: "/icons/apps/clock.png"},
                      {title: "Compass" , src: "/icons/apps/compass.png"},
                      {title: "Email" , src: "/icons/apps/email.png"},
                      {title: "Facebook" , src: "/icons/apps/facebook.png"},
                      {title: "Gallery" , src: "/icons/apps/gallery.png"},
                      {title: "Gmail" , src: "/icons/apps/gmail.png"},
                      {title: "Map" , src: "/icons/apps/gmap.png"},
                      {title: "Google Talk" , src: "/icons/apps/gtalk.png"},
                      {title: "Mic" , src: "/icons/apps/mic.png"},
                      {title: "Note" , src: "/icons/apps/note.png"},
                      {title: "Search" , src: "/icons/apps/search.png"},
                      {title: "Voice" , src: "/icons/apps/voice.png"},
                      {title: "Web" , src: "/icons/apps/web.png"},
                      {title: "Youtube" , src: "/icons/apps/youtube.png"},
                      {title: "Add Icon" , src: "/icons/menu/add.png"},
                      {title: "Call Icon" , src: "/icons/menu/call.png"},
                      {title: "Camera" , src: "/icons/menu/camera.png"},
                      {title: "Delete" , src: "/icons/menu/delete.png"},
                      {title: "Direction" , src: "/icons/menu/direction.png"},
                      {title: "Disk" , src: "/icons/menu/disk.png"},
                      {title: "Gallery" , src: "/icons/menu/gallery.png"},
                      {title: "Info" , src: "/icons/menu/info.png"},
                       {title: "Location" , src: "/icons/menu/location.png"},
                       {title: "Pencil" , src: "/icons/menu/pencil.png"},
                       {title: "Question" , src: "/icons/menu/question.png"},
                       {title: "Refresh" , src: "/icons/menu/refresh.png"},
                       {title: "Search" , src: "/icons/menu/search.png"},
                       {title: "Star" , src: "/icons/menu/star.png"},
                       {title: "Tool" , src: "/icons/menu/tool.png"},
                       {title: "Trash" , src: "/icons/menu/trash.png"},
                        {title: "Zoom" , src: "/icons/menu/zoom.png"}
            ];
            
            for(var i = 0 ; i < widgetArr.length; i++){
                    widgetArr[i].src = imgFolderPrefix + widgetArr[i].src;
            }
            initWidgetArea(widgetArr);
            
    }
    else if(widgetSetType == "iPhone")
    {
            var imgFolderPrefix = "/images/mockup/iphone/";
            var widgetArr = [ {title: "Navigation Bar" , src:  "nav_bar.png"} ,
                      {title: "Textbox" , src: "textbox.png"},
                      {title: "Search Bar" , src: "search_bar.png"},
                      {title: "Date Picker" , src: "date_picker_sample.png"},
                      {title: "Item Picker" , src: "picker.png"},
                      {title: "Camera Permisson" , src: "camera_permission.png"},
                      {title: "Photo Albums" , src: "photo_albums.png"},
                      {title: "Photo Gallery" , src: "photo_gallery.png"},
                      {title: "Volume" , src: "volume.png"},
                      {title: "Progress Bar" , src: "progress.png"},
                      {title: "On Switch" , src: "on.png"},
                      {title: "Off Switch" , src: "off.png"},
                      {title: "Index Vertical Bar" , src: "index.png"},
                      {title: "Number Pad" , src: "numpad.png"},
                      {title: "Button" , src: "button.png"},
                      {title: "Char Pad" , src: "charpad.png"},
                      {title: "Free Icon" , src: "free.png"},
                      {title: "Delete Icon" , src: "delete.png"},
                      {title: "Done" , src: "done.png"},
                      {title: "Edit" , src: "edit.png"},
                      {title: "Save" , src: "save.png"},
                      {title: "Cancel" , src: "cancel.png"},
                      {title: "Cross Icon" , src: "cross.png"},
                      {title: "Search Icon" , src: "search.png"},
                      {title: "Trash Icon" , src: "trash.png"},
                      {title: "Pause Icon" , src: "pause.png"},
                      {title: "Add Icon" , src: "add.png"},
                      {title: "Edit Icon" , src: "edit_icon.png"},
                      {title: "Play Icon" , src: "play.png"},
                      {title: "Camera Icon" , src: "camera.png"},
                      {title: "Refresh Icon" , src: "refresh.png"},
                      {title: "Reply Icon" , src: "reply.png"}
                    ];
            
            for(var i = 0 ; i < widgetArr.length; i++){
                    widgetArr[i].src = imgFolderPrefix + widgetArr[i].src;
            }
            initWidgetArea(widgetArr);
    }
}

function initWidgetArea(widgetArr){
     
    var html = "<table width='100%'>";
    
    // add in text and link elements
    html += "<tr>";
    html += "<td><div> <span class='defaultWidget' widgetType='text'>Text</span> </div>  <div class='widgetDesc'>Text</div> </td>";
    html += "<td><div> <span class='defaultWidget' widgetType='rect'>Rectangle</span> </div>  <div class='widgetDesc'>Rectangle</div> </td>";
    html += "</tr>";
    
    html += "<tr>";
    html += "<td><div> <span class='defaultWidget' widgetType='circle'>Circle</span> </div>  <div class='widgetDesc'>Circle</div> </td>";
    html += "<td><div> <span class='defaultWidget' widgetType='roundrect'>Rounded Rectangle</span> </div>  <div class='widgetDesc'>Rounded Rectangle</div> </td>";
    html += "</tr>";
    
    for(var i = 0 ; i < widgetArr.length; i++){
        
        if(i%2 == 0)
        {
            html += "<tr>";
        }
        
        html += "<td>";
        html = html + "<div class='widgetThumbnailDiv'><img class='widgetThumbnail' src='" + widgetArr[i].src + "' /></div>";
        html = html + "<div class='widgetDesc'>" + widgetArr[i].title + "</div>" ;
        html += "</td>";
        
        if( (i%2 != 0) )
        {
            html += "</tr>";
        }
        else if( i == (widgetArr.length - 1)  ) // last item
        {
            html += "</tr>";
        }
    }
    
    html += "</table>";
    $("#widgetArea").html(html);

    // setup dragging action to move into canvas
    setupDragForWidgets();
    var isMobileDevice = HUtil.isMobile();
    
    //only enable scrollbar for desktop
    if(isMobileDevice)
    {
        // NOTE: tiny scrollbar mouse events causing conflict with simulating mouse events for jquery ui drag/drop
        // workaround by create a touch version only
        
        // scroll with the thumb
         setTimeout (  function(){
                    $('#widgetScroller').tinyTouchscrollbar();
                    
                    $('img.widgetThumbnail').load(function(){
                            setTimeout(function(){
                                    //console.log("update scroll bar");
                                    $('#widgetScroller').tinyTouchscrollbar_update('relative');
                                    
                            },100);
                            
                    });
                    
            
            }, 500 );
        
        
    }
    else
    {
            setTimeout (  function(){
                    $('#widgetScroller').tinyscrollbar();
                    
                    $('img.widgetThumbnail').load(function(){
                            setTimeout(function(){
                                    //console.log("update scroll bar");
                                    $('#widgetScroller').tinyscrollbar_update('relative');
                                    
                            },100);
                            
                    });
                    
            
            }, 500 );
    }
    
   
   
}

function setupDragForWidgets(){
     
    $("#widgetArea .widgetThumbnail").draggable({
        cursor: 'move',
        /*containment: '#drawingArea',*/
        appendTo: "body",
        helper: function(event){
            
            var imgSrc = $(this).attr('src');
            return '<div class="myWidget"><img src="' + imgSrc + '" /></div>';
        }
       
       
    });
    
     $("#widgetArea .defaultWidget").draggable({
        cursor: 'move',
        /*containment: '#drawingArea',*/
        appendTo: "body",
        helper: function(event){
            var widgetType = $(this).attr('widgetType');
            if(widgetType == 'text')
                return "<div class='defaultWidget' widgetType='text'>Add Some Text</div>";
            else if (widgetType == 'rect')
            {
                return "<div class='defaultWidget' widgetType='rect'>Add Rectangle</div>";
            }
            else if(widgetType == 'circle')
            {
                return "<div class='defaultWidget' widgetType='circle'>Add Circle</div>";
            }
            else if(widgetType == 'roundrect')
            {
                return "<div class='defaultWidget' widgetType='roundrect'>Add Rounded Rectangle</div>";
            }
            
            return $(this).html();
        }
        
    });
}


//simulate mouse events for property panel so that color picker still work
function initTouch()
{

	if(HUtil.isMobile() ) // only do this for mobile devices
	{
	
	    HUtil.initTouchEvents( $('.colorpicker') ); 
	    HUtil.initTouchEvents(  $('#widgetArea .ui-draggable') );
	}

}