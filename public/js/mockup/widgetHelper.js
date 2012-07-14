function setupWidget(widgetType, layer, widgetObj, x, y,  width, height)
{
    var group = new Kinetic.Group({
        draggable: true,
        name: "mainGroup"
    });
    
    group.add(widgetObj);
    layer.add(group);
    
    if(widgetType == "text")
    {
        // calculate the width and height
        layer.draw(); // refresh layer
        width = widgetObj.getTextWidth();
        height = widgetObj.getTextHeight();
        
        // for text, x & y are the center point
        // need to reset the x,y position to the top left point
        x = x - width/2;
        y = y - height/2;
        
        //console.log("x: " + x + ", y " + y);
        //console.log("width: " + width + ", height " + height);
    }
    else if(widgetType == "circle")
    {
        // for circle, x, y is the center point, recalculate to position anchor correctly
        // recalculate to the top left point
        x = x - width/2;
        y = y - height/2;
        
    }
    
    addAnchors(group, layer , x , y , width, height , widgetObj);
    
    // clear the active element if there is any
    if(MyApp.activeElements.length > 0)
        MyApp.clearActiveElements(false); // saving the draw call as layer later will be redraw anyway
    
    MyApp.activeElements.push(group); // add the newly added item to active element
    //console.log("active elements length " + MyApp.activeElements.length);
    
    layer.draw(); // refresh layer
    
    checkPropertyPanel();
    
    setupGroupEvents(widgetType, widgetObj, group);
}

function setupGroupEvents(widgetType, widgetObj, group)
{
    var layer = MyApp.layer;
    
    group.on('click touchstart', function(e) {
        var curElement = this;
        //console.log("widget onclick");
        
        // need to check whether the Shift key is being pressed, if it is pressed
        // then do not clear the current active element
        if(MyApp.isShiftKeyPressed)
        {
        
        }
        else // shift key not pressed, then just clear all the elements
        {
            MyApp.clearActiveElements(false); // saving the draw call as layer later will be redraw anyway
            
        }
        
        // add the element to active array if not inside
        if($.inArray(group, MyApp.activeElements) == -1)
        {
            //console.log("add active elements");
            MyApp.activeElements.push(curElement);
            
            //console.log("active elements length " + MyApp.activeElements.length);
        }
        
        // make the highlight rect visible
        // draw
        var anchorGroup = curElement.get('.anchorGroup')[0];
        anchorGroup.attrs.visible = true;
        
        // set the color if currently there is only 1 active element
        if(MyApp.activeElements.length == 1)
        {
            if(widgetType == "text")
            {
                 setTextProperties(widgetObj); // init value of text properties
            }
            else
            {
                  setPropertiesBox(widgetType, widgetObj);
            }
        }
        
        curElement.moveToTop();
        
        layer.draw();
        
        checkPropertyPanel();
    });
    
    group.on('dragstart', function(e) {
    
        var curElement = this;
        //console.log("widget drag start");
        
        
        // add the element to active array if not inside
        if($.inArray(group, MyApp.activeElements) == -1)
        {
            // need to check whether the Shift key is being pressed, if it is pressed
            // then do not clear the current active element
            if(MyApp.isShiftKeyPressed)
            {
            
            }
            else // shift key not pressed, then just clear all the elements
            {
                MyApp.clearActiveElements(false); // saving the draw call as layer later will be redraw anyway
                
            }
            
            //console.log("add active elements");
            MyApp.activeElements.push(curElement);
            
            //console.log("active elements length " + MyApp.activeElements.length);
        }
        else // already an active element , dun do anything
        {
            
        }
        
        // make the highlight rect visible
        // draw
        var anchorGroup = curElement.get('.anchorGroup')[0];
        anchorGroup.attrs.visible = true;
        // set the color if currently there is only 1 active element
        if(MyApp.activeElements.length == 1)
        {
            if(widgetType == "text")
            {
                  setTextProperties(widgetObj); // init value of text properties
            }
            else
            {
                  setPropertiesBox(widgetType, widgetObj);
            }
        }
        
        curElement.moveToTop();
        
        layer.draw();
        
        //MyApp.lastClickTime = (new Date()).getTime(); // store last click time
        var position = curElement.getAbsolutePosition();
        MyApp.lastDragPosition = position;
      
        checkPropertyPanel();
    });
    
    group.on('dragmove', function(e){
        //console.log("drag move" );
        var curElement = this;
        var position = curElement.getAbsolutePosition();
        
        if(MyApp.activeElements.length  > 1) // only do this if there is at least 2 elements
        {
            // record down last position, then move all elements accordingly
            var lastPosition = MyApp.lastDragPosition;
            var diffX = position.x - lastPosition.x;
            var diffY = position.y - lastPosition.y;
        
            for(var i = 0 ; i < MyApp.activeElements.length ; i++)
            {
                var cur = MyApp.activeElements[i];
                if(cur!=curElement)
                {
                    var oldPos = cur.getAbsolutePosition();
                    var newPos = {
                        x: oldPos.x + diffX,
                        y: oldPos.y + diffY
                    };
                    cur.setAbsolutePosition(newPos);
                }
            }
        }
        
        //console.log("pos x : " + position.x + " , y: " + position.y);
        MyApp.lastDragPosition = position;
    });
    
    
    group.on('dragend', function(e) {
        //console.log("drag end" );
        var curElement = this;
        var anchorGroup = curElement.get('.anchorGroup')[0];
        var position = anchorGroup.getAbsolutePosition();
        //console.log("pos x : " + position.x + " , y: " + position.y);
    });
    
}