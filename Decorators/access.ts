




function First(target:Object,key:string,descriptor:PropertyDescriptor){
    console.log('First descriptor applied to',key)
}


function Second(target:Object,key:string,descriptor:PropertyDescriptor){
    console.log('Second descriptor applied to',key)
}


@First

@Second

class Example{
   
    show(){
        console.log('Hello')
    }
}