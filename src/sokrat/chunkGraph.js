
function СhunkElement(arg){
    if(typeof arg !="object"){
        mixin(this,{
            name: arg,
            values: {},
            groups: {},
            path: [],
            dataElement: null   // DataElement
        });
    }else{
        mixin(this,{
            name: arg.name,
            values: clone(arg.values),
            groups: clone(arg.groups),
            path: arg.path.copy(),
            dataElement: arg.dataElement   // DataElement
        });
    }
}





СhunkElement.prototype.getValue = function(valueName){
    if(this.values[valueName] != undefined)return this.values[valueName];
    return Checker.values[valueName];
};



СhunkElement.isConflict = function(grA,grB){
    for(var valueA in grA){
        for(var valueB in grB){
            if(valueA == valueB && grA[valueA] != grB[valueB]){
                return true;
            }
        }
    }
    return false;
};

/**
 * объединение результатов. возвращает группу графем со всеми возможными наборами переменных
 * @param chunk
 * @param groupA
 * @param groupB
 */
СhunkElement.prototype.mergeResults = function (groupA,groupB){
    var resultGroup = [];
    for(var  a= groupA.length;a--;){
        for(var b = groupB.length;b--;){
            if(СhunkElement.isConflict(groupA[a].values, groupB[b].values))continue;

            var _g = new СhunkElement(this);
            mixin(_g.values, groupA[a].values);
            mixin(_g.values, groupB[b].values);

            var toadd = true;

            for(var i= resultGroup.length;i--;){
                if(!СhunkElement.isConflict(resultGroup[i].values,_g.values)){
                    toadd = false;
                    break;
                }
            }
            if(toadd){

                mixin(_g.groups, groupA[a].groups);
                mixin(_g.groups, groupB[b].groups);


                resultGroup.push(_g);
            }
        }
    }
    return resultGroup;
};

function DataElement(name){
    mixin(this,{
        prop:  {},
        cns:   {},
        graph: 0,
        sense: 0,
        name:  name,
        alias: ""
    });
}


/**
 * Соединение графем
 * @param a
 * @param port1
 * @param b
 * @param port2
 */
DataElement.connect = function(a,port1,b,port2){
    if(port1){
        if(!a.cns[port1])a.cns[port1]=[];
        a.cns[port1].push([b.name ,port2]);
    }
    if(port2){
        if(!b.cns[port2])b.cns[port2]=[];
        b.cns[port2].push([a.name ,port1]);
    }
};