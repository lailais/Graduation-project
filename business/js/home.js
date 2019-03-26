$(()=>{
    var unCookList = []
    var currentOrderList = []
    var bSelected = []
    var subTotal = 0
    var payOrderList = []
    var todayPayList = []
    var subOrderDetailDeskId = 0
    var subOrderDetailSubOrderListId = 0
    var payOrderDetailDeskId = 0
    var allShopList = []
    var changeShopName = ''

    $.ajax({
        type: "GET",
        url: 'http://172.20.10.2:3000/unpayList',
        dataType: "json",
        success: function (list) {
            updataList(list.unpayList)
            // console.log(unCookList)
            // console.log(currentOrderList)
            renderUncookList(unCookList)
            renderUnpayList(currentOrderList)
        },
        error: function (data) {
            console.log('error')
        }
    })

    var socket = io.connect('http://172.20.10.2:3000/')
    socket.on('fromcSeleted', function (list) {
        unCookList = [] // 置空
        currentOrderList = []
        updataList(list.unpayList)
        // console.log(unCookList)
        // console.log(currentOrderList)
        renderUncookList(unCookList)
        renderUnpayList(currentOrderList)
    })

    $('.orderList').on('click', '.list', (event)=>{
        $(event.target).children('div').show()
    })
    $('.orderList').on('click', '.list>div>.back', (event)=>{
        $(event.currentTarget).parent('div').hide()
    })

    //show uncookList
    $('.orderList').on('click', '.uncookList>div>ul>li', (event)=>{
        subOrderDetailDeskId = $(event.currentTarget).attr('deskId')
        subOrderDetailSubOrderListId = $(event.currentTarget).attr('subOrderListId')
        renderSubOrderDetail(subOrderDetailDeskId,subOrderDetailSubOrderListId)
    })
    $('.orderList').on('click', '.uncookList>div>ul>li>.btn-container>.change-btn', (event)=>{
        event.stopPropagation()
        subOrderDetailDeskId = $(event.currentTarget).parents("li").attr('deskId')
        subOrderDetailSubOrderListId = $(event.currentTarget).parents("li").attr('subOrderListId')
        renderSubOrderDetail(subOrderDetailDeskId,subOrderDetailSubOrderListId)
        renderBtn(true)
        initBselected(subOrderDetailDeskId, subOrderDetailSubOrderListId)
        $('#subOrderDetail > div.subOrderDetail-container > table > tbody > tr span ').css('display','inline-block')
    })
    $('.orderList').on('click', '.uncookList>div>ul>li>.btn-container>.cook-btn', (event)=>{
        event.stopPropagation()
        subOrderDetailDeskId = $(event.currentTarget).parents("li").attr('deskId')
        subOrderDetailSubOrderListId = $(event.currentTarget).parents("li").attr('subOrderListId')
        updataCook(subOrderDetailDeskId, subOrderDetailSubOrderListId)
    })
    $('#subOrderDetail > div.close').click((event)=>{
        $(event.target).parent('#subOrderDetail').hide()
        renderBtn(false)
    })
    $('#subOrderDetail > div.btn-container > span.change-btn.btn').click((event)=>{
        renderBtn(true)
        initBselected(subOrderDetailDeskId, subOrderDetailSubOrderListId)
        $('#subOrderDetail > div.subOrderDetail-container > table > tbody > tr span ').css('display','inline-block')
    })
    $('#subOrderDetail > div.btn-container > span.cook-btn.btn').click((event)=>{
        updataCook(subOrderDetailDeskId, subOrderDetailSubOrderListId)
        $(event.target).parents('#subOrderDetail').hide()
    })
    $('#subOrderDetail > div.btn-container > span.cancel-btn.btn').click((event)=>{
        renderSubOrderDetail(subOrderDetailDeskId,subOrderDetailSubOrderListId)
        renderBtn(false)
        $('#subOrderDetail > div.subOrderDetail-container > table > tbody > tr span ').hide()
    })
    $('#subOrderDetail > div.btn-container > span.confirm-btn.btn').click((event)=>{
        renderBtn(false)
        $('#subOrderDetail > div.subOrderDetail-container > table > tbody > tr span ').hide()
        socket.emit('bSelected', { //向后台触发bSelected事件，并传参
            'bSelected': bSelected.subShopList,
            'subOrderListId': bSelected.subOrderListId,
            'deskId':bSelected.deskId,
            'subTotal': bSelected.subTotal,
            'status': 0
        })
    })
    $('#subOrderDetail').on('touchend','.subOrderDetail-container > table > tbody > tr > td:nth-child(1) > span',(event)=>{
        renderChangeCount(2)
    })
     $('#subOrderDetail').on('touchend','.subOrderDetail-container > table > tbody > tr > td:nth-child(3) > span:first-child',(event)=>{
         renderChangeCount(1)
    })
    $('#subOrderDetail').on('click','.subOrderDetail-container > table > tbody > tr > td:nth-child(3) > span:last-child',(event)=>{
        renderChangeCount(0)
    })

    //show unpayList
    $('.orderList').on('click','.unpayList.list > div > ul > li', (event)=>{
        payOrderDetailDeskId = $(event.currentTarget).attr('deskId')
        renderUnpayOrderDetail(payOrderDetailDeskId)
    })
    $('#unpayOrderDetail').on('click', '.close', ()=>{
    $('#unpayOrderDetail').hide()
    })
    $('.orderList').on('click','.unpayList.list > div > ul > li > .btn-container > .checkout-btn', (event)=>{
        event.stopPropagation()
        let deskId = $(event.currentTarget).parents("li").attr("deskId")
        for (let i = 0; i < currentOrderList.length; i++) {
            if (currentOrderList[i].deskId == deskId) {
                for (let j = 0; j < currentOrderList[i].shopList.length; j++) {
                    if (!currentOrderList[i].shopList[j].status) {
                        alert("该订单还有未制作的清单！！")
                        return
                    }
                }
                socket.emit('payDeckId', { //向后台触发payDeckId事件，并传参
                    'deskId': deskId,
                })
                for(let i = 0; i<currentOrderList.length; i++){
                    if(currentOrderList[i].deskId == deskId) {
                        currentOrderList.splice(i,1) // 更新未支付数组
                        renderUnpayList(currentOrderList)// 更新未支付列表
                    }
                }
            }
        }
    })
    $('#unpayOrderDetail > div.btn-container > .checkout-btn').click((event)=>{
        for (let i = 0; i < currentOrderList.length; i++) {
            if (currentOrderList[i].deskId == payOrderDetailDeskId) {
                for (let j = 0; j < currentOrderList[i].shopList.length; j++) {
                    if (!currentOrderList[i].shopList[j].status) {
                        alert("该订单还有未制作的清单！！")
                        return
                    }
                }
                socket.emit('payDeckId', { //向后台触发payDeckId事件，并传参
                    'deskId': payOrderDetailDeskId,
                })
                for(let i = 0; i<currentOrderList.length; i++){
                    if(currentOrderList[i].deskId == payOrderDetailDeskId) {
                        currentOrderList.splice(i,1) // 更新未支付数组
                        renderUnpayList(currentOrderList)// 更新未支付列表
                    }
                }
                $('#unpayOrderDetail').hide()
            }
        }
    })

    //show payList
    $('.payList').on('click', (event)=>{
        $.ajax({
            type: "GET",
            url: 'http://172.20.10.2:3000/payList',
            dataType: "json",
            success: function (list) {
                todayPayList = list.payList
                renderPayList(list.payList)
            },
            error: function (data) {
                console.log('error')
            }
        })
    })
    $('.orderList').on('click','.payList.list > div > ul > li', (event)=>{
        renderPayOrderDetail($(event.currentTarget).attr('orderId'))
    })
    $('#payOrderDetail').on('click', '.close', ()=>{
        $('#payOrderDetail').hide()
    })
    $('.search>button').click((event)=>{
        // 点击搜索订单号的按钮
        let orderId = $(event.target).siblings('input').val()
        // 判断一串字符是不是全部是数字
        var rex = /^[0-9]+$/;//正则表达式
        var flag = rex.test(orderId);//通过表达式进行匹配
        if (flag) {
            renderInputOrderDetail(orderId)
        } else {
            alert("请输入正确的订单号");
        }
        $(event.target).siblings('input').val('')
    })

    //click orderList btn ,show orderList
    $('.order-info').click(()=> {
        $('.orderList').show()
        $('.order-info').addClass('active')
        $('.shopList').hide()
        $('.shop-info').removeClass('active')
    })

    //click shopInfo btn ,show shopList
    $('.shop-info').click(()=> {
        $('.orderList').hide()
        $('.order-info').removeClass('active')
        $('.shopList').show()
        $('.shop-info').addClass('active')
        $.ajax({
            type: "GET",
            url: 'http://172.20.10.2:3000/allShopList',
            dataType: "json",
            success: function (data) {
                allShopList = data.goods
                renderShopList(allShopList[0])
                renderSubHeader(0)
            },
            error: function (data) {
                console.log('error')
            }
        })
    })
    $('.shopList>.title>.back').click(()=>{
        $('.orderList').show()
        $('.order-info').addClass('active')
        $('.shopList').hide()
        $('.shop-info').removeClass('active')
    })
    $('.shopList').on('click', '.sub-header > ul > li', (event)=>{
        let id = $('.sub-header > ul > li').index($(event.target))
        renderShopList(allShopList[id])
        $('.shopList>.sub-header>.subHeader-ul>li').removeClass('active')
        $(`.shopList>.sub-header>.subHeader-ul>li:nth-child(${++id})`).addClass('active')
    })
    $('.shopList').on('click', '.add', (event)=>{
        $('#addPopUp').show()
        let x = ''
        for(let i=0; i<allShopList.length; i++){
            x += `<li>${allShopList[i].name}</li>`
        }
        $('#addPopUp>.list>ul').html(x)
    })
    $('.shopList').on('click', '.content > .content-ul > li > div.btn-container > .change-btn', (event)=>{
        let oldImgUrl =  $(event.target).parents('.foods').children('.icon').children('img').attr('src')
        let oldName = $(event.target).parents('.foods').children('.name').children('span').eq(1).text()
        let oldoldPrice = $(event.target).parents('.foods').children('.price').find('span').eq(1).text()
        let oldnewPrice = $(event.target).parents('.foods').children('.price').find('span').eq(3).text()
        let oldDescription = $(event.target).parents('.foods').children('.description').children('p').text()
        let foodObj = {
            oldImgUrl,
            oldName,
            oldoldPrice,
            oldnewPrice,
            oldDescription
        }
        renderFoodDetail(foodObj)
        changeShopName = oldName
    })
    $('.shopList').on('click', '.content > .content-ul > li > div.btn-container > .delete-btn', (event)=> {
        // console.log(allShopList)
        let index = $('.shopList > .sub-header > .subHeader-ul > li.active').index()
        let name = $(event.target).parents('li.foods').children('.name').children('span').eq(1).text()
        let count = 0;
        let arr = []
        $(event.target).parents('li.foods').attr('data-active',1)
        for(let i = 0; i<allShopList.length; i++){
            for(let j = 0; j<allShopList[i].foods.length; j++){
                let food = allShopList[i].foods[j]
                if(food.name == name){
                    count++
                    arr.push(allShopList[i].name)
                }
            }
        }
        if(count>1){
            let x ='该菜式在以下组存在：'
            for(let i=0; i<arr.length; i++){
                x += arr[i]+';&nbsp;'
            }
            x += '<br/>请选择删除单个或是删除全部！'
            $('#deletePopUp>.container>p').html(x)
            $('#deletePopUp').show()
        }else{
            deleteFoods(name, 0)
        }
    })
    $('#foodDetail').on('click', 'div.container> .upLoadImg',(()=>{
        $('#foodDetail input[type=file]').click()
    }))
    $('#foodDetail').on('change','input[type=file]',(()=>{
        selectImg($('#foodDetail input[type=file]')[0], $('#foodDetail .newImg')[0])
    }))
    $('#foodDetail>.close,#foodDetail>.btn-container').click(()=>{
        $('#foodDetail').css('display','none')
    })
    $('#foodDetail>.btn-container>.confirm-btn').click((event)=>{
        let newImgUrl =  $(event.target).parents('#foodDetail').find('.newImg').attr('src')
        let newName = $(event.target).parents('#foodDetail').find('.name').children('input').val()
        let newoldPrice =$(event.target).parents('#foodDetail').find('.oldPrice').children('input').val()
        let newnewPrice = $(event.target).parents('#foodDetail').find('.newPrice').children('input').val()
        let newDescription = $(event.target).parents('#foodDetail').find('.description').children('textarea').val()
        if(!newImgUrl){
            newImgUrl =  $(event.target).parents('#foodDetail').find('.img').children('img').attr('src')
        }
        let foodObj = {
            name:newName,
            price:newnewPrice,
            oldPrice:newoldPrice,
            icon:newImgUrl,
            description:newDescription,
            info: ''
        }
        let index = $('.shopList > .sub-header > .subHeader-ul > li.active').index()
        for(let j=0; j<allShopList.length; j++){
            let foodList = allShopList[j].foods
            for(let i=0; i<foodList.length; i++){
                if(foodList[i].name == changeShopName){
                    foodList[i] = foodObj
                }
            }
        }
        renderShopList(allShopList[index])
        $.ajax({
            type: "GET",
            url: 'http://172.20.10.2:3000/changeShopList',
            dataType: "json",
            data: {changeShopName, foodObj},
            success: function (data) {
                alert(data.data)
            },
            error: function () {
                console.log('error')
            }
        })
    })
    $('#deletePopUp>.container>.close-container>.close, #deletePopUp>.container>.btn-container').click((event)=>{
        $('#deletePopUp').hide()
    })
    $('#deletePopUp>.container>.btn-container>.single-btn').click((event)=>{
        let deleteElement = $('.shopList>.content > .content-ul> li.foods[data-active=1]')
        let name = deleteElement.children('.name').children('span').eq(1).text()
        deleteFoods(name, 0)
        $('.shopList>.content > .content-ul> li.foods').attr('data-active',0)
    })
    $('#deletePopUp>.container>.btn-container>.all-btn').click((event)=>{
        let deleteElement = $('.shopList>.content > .content-ul> li.foods[data-active=1]')
        let name = deleteElement.children('.name').children('span').eq(1).text()
        deleteFoods(name, 1)
        $('.shopList>.content > .content-ul> li.foods').attr('data-active',0)
    })
    $('#addPopUp > div.btn-container, #addPopUp > div.close-container > .close').click(()=>{
        $('#addPopUp').hide()
        $('#addPopUp input').val('')
        $('#addPopUp textarea').val('')
        $('#addPopUp img').attr("src",'')
    })
    $('#addPopUp > div.btn-container>.confirm-btn').click((event)=> {
        let icon = $(event.target).parents('#addPopUp').find('.newImg').attr('src')
        let name = $(event.target).parents('#addPopUp').find('.name').children('input').val()
        let oldPrice = $(event.target).parents('#addPopUp').find('.oldPrice').children('input').val()
        let price = $(event.target).parents('#addPopUp').find('.newPrice').children('input').val()
        let description = $(event.target).parents('#addPopUp').find('.description').children('textarea').val()
        for(let i=0; i<allShopList.length; i++){
            for(let j=0; j<allShopList[i].foods.length; j++){
                if(allShopList[i].foods[j].name == name){
                    alert('菜品不允许同名！')
                    return
                }
            }
        }
        let foodObj = {
            icon,
            name,
            oldPrice,
            price,
            description,
            info: ''
        }
        let index = $('.shopList > .sub-header > .subHeader-ul > li.active').index()
        let arr = []
        for(let i = 0; i< $('#addPopUp > div.list>ul>li').length; i++){
            if($($('#addPopUp > div.list>ul>li')[i]).hasClass('active')){
                arr.push(i)
            }
        }
        for(let j=0; j<arr.length; j++){
            allShopList[Number(arr[j])].foods.push(foodObj)
        }
        renderShopList(allShopList[index])
        $.ajax({
            type: "GET",
            url: 'http://172.20.10.2:3000/addFood',
            dataType: "json",
            data: {foodObj, arr},
            success: function (data) {
                alert(data.data)
            },
            error: function () {
                console.log('error')
            }
        })
    })
    $('#addPopUp > div.list').on('click', 'ul>li', (event)=>{
        if($(event.target).hasClass('active')){
            $(event.target).removeClass('active')
        } else {
            $(event.target).addClass('active')
        }
    })
    $('#addPopUp > div.container>.upLoadImg').click(()=>{
        $('#addPopUp > div.container>input[type=file]').click()
    })
    $('#addPopUp input[type=file]').change(function () {
        selectImg(this, $('#addPopUp .newImg')[0])
    })

    function updataList(cSelected) { // 更新已选择列表
        for (let i = 0; i < cSelected.length; i++) {
            for (let j = 0; j < cSelected[i].shopList.length; j++) {
                if (cSelected[i].shopList[j].status == 0) {
                    unCookList.push(cSelected[i].shopList[j]) // 更新未制作清单数组
                }
            }
        }
        currentOrderList = cSelected
    }

    function renderUncookList(list) {
        let x = ''
        for(let i = 0; i<list.length; i++){
            let time = getTemplateDate(list[i].createTime)
            x += ` <li deskId = "${list[i].deskId}" subOrderListId = "${list[i].subOrderListId}">
                            <div class="deskInfo">
                                <h1>桌号：${list[i].deskId}</h1>
                                <h2>清单号：${list[i].subOrderListId}</h2>
                                <h4>小计：${list[i].subTotal}</h4>
                                <h4>下单时间：${time}</h4>
                            </div>
                            <div class="btn-container">
                                <span class="cook-btn btn">制作</span>
                                <span class="change-btn btn">修改</span>
                            </div>
                        </li>`
        }
        $('.uncookList .uncookList-ul').html(x)
    }

    function renderUnpayList(list) {
        let x = ''
        for(let i = 0; i<list.length; i++){
            x += ` <li deskId = "${list[i].deskId}">
                            <div class="deskInfo">
                                <h1>桌号：${list[i].deskId}</h1>
                                <h2>总计：${list[i].total}</h2>
                            </div>
                            <div class="btn-container">
                                <span class="checkout-btn btn">结账</span>
                            </div>
                        </li>`
        }
        $('.unpayList .unpayList-ul').html(x)
    }

    function renderPayList(list) {
        let x = ''
        for(let i = 0; i < list.length; i++){
            x += `
            <li deskId = "${list[i].deskId}" orderId="${list[i].id}">
                                <div class="deskInfo">
                                    <h2>订单号：${list[i].id}</h2>
                                    <h2>桌号：${list[i].deskId}</h2>
                                    <h3>总计：${list[i].total}</h3>
                                    <h3>结账时间：${getTemplateDate(list[i].payTime)}</h3>
                                </div>
                            </li>`
        }
        $('.orderList > div.payList.list > div > .payList-ul').html(x)
    }

    function renderSubOrderDetail(deskId,subOrderListId) {
        let x = ''
        for(let i = 0;i<unCookList.length; i++){
            if(unCookList[i].deskId == deskId && unCookList[i].subOrderListId == subOrderListId){
                x += ` 
        <h1 class="deskId">桌号：${deskId}</h1>
        <h2 class="subOrderListId">清单号：${subOrderListId}</h2>
        <table cellspacing="0" cellpadding="0" border="0">
            <tr align="center">
                <td>菜名</td>
                <td>单价</td>
                <td>数量</td>
                <td>总价</td>
            </tr>`
                for(let j=0; j<unCookList[i].subShopList.length; j++){
                    x +=   `<tr align="center">
                <td><span>-</span><div class="name">${unCookList[i].subShopList[j].name}</div></td>
                <td>${unCookList[i].subShopList[j].price}</td>
                <td><span>-</span><div style="display: inline-block;" class="text">${unCookList[i].subShopList[j].count}</div><span>+</span></td>
                <td>${unCookList[i].subShopList[j].price*unCookList[i].subShopList[j].count}</td>
            </tr>`
                }
                x += `</table><div class="subtotal">小计：${unCookList[i].subTotal}</div>`
            }
        }
        $('#subOrderDetail>.subOrderDetail-container').html(x)
        $('#subOrderDetail').show()
    }

    function renderBtn(clickChangeBtn) {
        if(clickChangeBtn){
            $('#subOrderDetail > div.btn-container > span.change-btn.btn').hide()
            $('#subOrderDetail > div.btn-container > span.cook-btn.btn').hide()
            $('#subOrderDetail > div.btn-container > span.confirm-btn.btn').css('display','inline-block')
            $('#subOrderDetail > div.btn-container > span.cancel-btn.btn').css('display','inline-block')
        } else {
            $('#subOrderDetail > div.btn-container > span.change-btn.btn').show()
            $('#subOrderDetail > div.btn-container > span.cook-btn.btn').show()
            $('#subOrderDetail > div.btn-container > span.confirm-btn.btn').hide()
            $('#subOrderDetail > div.btn-container > span.cancel-btn.btn').hide()
        }
    }

    function renderUnpayOrderDetail(deskId) {
        let x = ''
        x += `
        <h1 class="deskId">桌号：${deskId}</h1>
        <ul>`
        for(let i = 0; i<currentOrderList.length; i++){
            if(currentOrderList[i].deskId == deskId){
                for(let j = 0; j<currentOrderList[i].shopList.length; j++){
                    let shopList = currentOrderList[i].shopList[j]
                    x += `<li>
                <h3 class="subOrderListId">清单号：${shopList.subOrderListId}&nbsp;&nbsp;${shopList.status?"已制作":"未制作"}</h3>
                <table cellspacing="0" cellpadding="0" border="0">
                    <tr align="center">
                        <td>菜名</td>
                        <td>单价</td>
                        <td>数量</td>
                        <td>小计</td>
                    </tr>`
                        for(let k = 0; k<shopList.subShopList.length; k++){
                            x += `<tr align="center">
                        <td>${shopList.subShopList[k].name}</td>
                        <td>${shopList.subShopList[k].price}</td>
                        <td>${shopList.subShopList[k].count}</td>
                        <td>${shopList.subShopList[k].price*shopList.subShopList[k].count}</td>
                    </tr>`
                        }
                x += `</table>
                <div class="sub-total">清单小结：${shopList.subTotal}</div>
            </li>`
                }
                x += `</ul><div class="total">总计：${currentOrderList[i].total}</div>`
            }
        }
        $('#unpayOrderDetail>.unpayOrderDetail-container').html(x)
        $('#unpayOrderDetail').show()
    }

    function renderPayOrderDetail(orderId, payList) {
        if(!payList) {
            payList = todayPayList
        }
        let x = ''
        for(let i = 0 ; i < payList.length; i++){
            if(payList[i].id == orderId){
                x += `
                <h2 class="orderId">订单号：${orderId}</h2>
                <h2 class="checkout-time">结账时间：${getTemplateDate(payList[i].payTime)}</h2>
                <h2 class="deskId">桌号：${payList[i].deskId}</h2>
                <ul>`
                for(let j = 0; j < payList[i].shopList.length; j++){
                    let shopList = payList[i].shopList[j]
                    x += `<li>
                <h3 class="subOrderListId">清单号：${shopList.subOrderListId}</h3>
                <table cellspacing="0" cellpadding="0" border="0">
                    <tr align="center">
                        <td>菜名</td>
                        <td>单价</td>
                        <td>数量</td>
                        <td>小计</td>
                    </tr>`
                        for(let k = 0 ; k < shopList.subShopList.length; k++){
                            x += `<tr align="center">
                        <td>${shopList.subShopList[k].name}</td>
                        <td>${shopList.subShopList[k].price}</td>
                        <td>${shopList.subShopList[k].count}</td>
                        <td>${shopList.subShopList[k].price*shopList.subShopList[k].count}</td>
                    </tr>`
                        }
                x += `</table>
                <div class="sub-total">清单小结：${shopList.subTotal}</div>
            </li>`
                }
                x += `</ul><div class="total">总计：${payList[i].total}</div>`
            }
        }
        $('#payOrderDetail>.payOrderDetail-container').html(x)
        $('#payOrderDetail').show()
    }

    function renderInputOrderDetail(orderId) {
        $.ajax({
            type: "GET",
            url: 'http://172.20.10.2:3000/getInputOrderDetail',
            data: {orderId},
            dataType: "json",
            success: function (list) {
                if(list.payList.length <= 0){
                    alert('订单不存在！')
                    return
                }
                renderPayOrderDetail(orderId, list.payList)
            },
            error: function (data) {
                console.log('error')
            }
        })
    }

    function renderSubHeader(id) {
        id++
        let x = ''
        for(let i=0; i<allShopList.length; i++){
            x += `<li>${allShopList[i].name}</li>`
        }
        $('.shopList>.sub-header>.subHeader-ul').html(x)
        $('.shopList>.sub-header>.subHeader-ul>li').removeClass('active')
        $(`.shopList>.sub-header>.subHeader-ul>li:nth-child(${id})`).addClass('active')
    }

    function renderShopList(list) {
        // console.log(list)
        let x = ''
        for(let i=0; i<list.foods.length; i++){
            let foods = list.foods[i]
            x += `<li class="foods">
                        <div class="icon">
                            <img src="${foods.icon}">
                        </div>
                        <div class="name">
                            <span>菜名：</span>
                            <span>${foods.name}</span>
                        </div>
                        <div class="price">
                            <span>原价：<span>${foods.oldPrice}</span></span>
                            <span>现价：<span>${foods.price}</span></span>
                        </div>
                        <div class="clear"></div>
                        <div class="description">
                            描述：<p>${foods.description}</p>
                        </div>
                        <div class="btn-container">
                            <span class="delete-btn btn">删除</span>
                            <span class="change-btn btn">修改</span>
                        </div>
                    </li>`
        }
        $('.shopList>.content>.content-ul').html(x)
    }

    function renderFoodDetail(foodObj) {
        // console.log(foodObj)
        let x = ''
        x += ` <div class="img">
            <img src="${foodObj.oldImgUrl}" alt="">
        </div>
         <div class="newImg-container">
            <span>⇨</span>
            <img src="" alt="" class="newImg">
        </div>
        <input type="file" hidden>
        <div class="upLoadImg">
            <span class="text">更改图片</span>
            <span class="icon icon-file">⇧</span>
        </div>
        <div class="name">
            菜名：<input type="text" value="${foodObj.oldName}">
        </div>
        <div class="oldPrice">
            原价：<input type="text" value="${foodObj.oldoldPrice}">
        </div>
        <div class="newPrice">
            现价：<input type="text" value="${foodObj.oldnewPrice}">
        </div>
        <div class="description">
            描述：<textarea>${foodObj.oldDescription}</textarea>
        </div>`
        $('#foodDetail>.container').html(x)
        $('#foodDetail').css('display', 'block')
    }

    function getTemplateDate(date) {
        let y = new Date(date).getFullYear()
        let m = new Date(date).getMonth()+1
        let d = new Date(date).getDate()
        let h = new Date(date).getHours()
        let min = new Date(date).getMinutes()
        return y + '-' + m + '-' + d + '&nbsp;'+ h + ':' + min
    }

    function renderChangeCount(type) {
        let price = Number($(event.target).parents('tr').find('td:nth-child(2)').text())
        let oldCount = Number($(event.target).siblings('.text').text())
        let oldSubTotal = Number($(event.target).parents('tr').find('td:nth-child(4)').text())
        let oldTotal = Number($('#subOrderDetail>.subOrderDetail-container>.subtotal').text().split('：')[1])
        let name = $(event.target).parents('tr').find('.name').text()
        let newCount = ''
        let newSubTotal = ''
        let newTotal = ''
        if(type === 0) {
             newCount = ++oldCount
             newSubTotal = oldSubTotal + price
             newTotal = oldTotal + price
            for(let i = 0; i<bSelected.subShopList.length; i++){
                 if(bSelected.subShopList[i].name == name){
                     bSelected.subShopList[i].count = newCount
                 }
            }
        } else if(type === 1) {
             newCount = --oldCount
             newSubTotal = oldSubTotal - price
             newTotal = oldTotal - price
            for(let i = 0; i<bSelected.subShopList.length; i++){
                if(bSelected.subShopList[i].name == name){
                    bSelected.subShopList[i].count = newCount
                    if (newCount == 0){
                        bSelected.subShopList.splice(i, 1)
                    }
                }
            }
        } else if(type === 2) {
            newCount = 0
            newTotal = oldTotal - oldSubTotal
            for(let i = 0; i<bSelected.subShopList.length; i++){
                if(bSelected.subShopList[i].name == name){
                    bSelected.subShopList.splice(i, 1)
                }
            }
        }
        bSelected.subTotal = newTotal
        if(newCount === 0){
            $(event.target).parents('tbody').find($(event.target).parent('td').parent('tr')).remove()
            $('#subOrderDetail>.subOrderDetail-container>.subtotal').text(`小计：${newTotal}`)
            return
        }
        $(event.target).siblings('.text').text(newCount)
        $(event.target).parents('tr').find('td:nth-child(4)').text(newSubTotal)
        $('#subOrderDetail>.subOrderDetail-container>.subtotal').text(`小计：${newTotal}`)
    }

    function initBselected(deskId, subOrderListId) {
        for(let i = 0;i<unCookList.length; i++){
            if(unCookList[i].deskId == deskId && unCookList[i].subOrderListId == subOrderListId){
                bSelected = JSON.parse(JSON.stringify(unCookList[i]))
            }
        }
    }

    function updataCook(deskId, subOrderListId) {
        socket.emit('updataCook', { //向后台触发bSelected事件，并传参
            'subOrderListId': subOrderListId,
            'deskId': deskId,
        })
    }

    function deleteFoods(name, style){
        let index = $('.shopList > .sub-header > .subHeader-ul > li.active').index()
        if(style){
            for(let j=0; j<allShopList.length; j++){
                let foodList = allShopList[j].foods
                for(let i=0; i<foodList.length; i++){
                    if(foodList[i].name == name){
                        foodList.splice(i, 1)
                    }
                }
            }
            $.ajax({
                type: "GET",
                url: 'http://172.20.10.2:3000/deleteFood',
                dataType: "json",
                data: {name},
                success: function (data) {
                    // alert(data.data)
                    console.log(data.data)
                },
                error: function () {
                    console.log('error')
                }
            })
        } else {
            let foodList = allShopList[index].foods
            for(let i=0; i<foodList.length; i++){
                if(foodList[i].name == name){
                    foodList.splice(i, 1)
                }
            }
            $.ajax({
                type: "GET",
                url: 'http://172.20.10.2:3000/deleteFood',
                dataType: "json",
                data: {name,  groupIndex: index},
                success: function (data) {
                    // alert(data.data)
                    console.log(data.data)
                },
                error: function () {
                    console.log('error')
                }
            })
        }
        renderShopList(allShopList[index])
    }

    function selectImg(file, image) {
        if (!file.files || !file.files[0]) {
            return;
        }
        var reader = new FileReader();//读取文件
        reader.onload = function (event) {//文件读取完成的回调函数
            //图片读取完成的回调函数（必须加上否则数据读入不完整导致出错！）
            compressImage(event.target.result, image)
        }
        //将文件已Data URL的形式读入页面
        reader.readAsDataURL(file.files[0]);
    }

    function compressImage(bdata, image) {//压缩图片
        var _this = this;
        var quality = 0.5; //压缩图片的质量
        var oldimglength = bdata.length;//压缩前的大小
        var compresRadio = 0;// 压缩率
        var canvas = document.createElement("canvas"); //创建画布
        var ctx = canvas.getContext("2d");
        var img = new Image();
        img.src = bdata;
        img.onload = function () {
            var width = img.width;
            var height = img.height;
            canvas.width = 100;   //这里可以自定义你的图片大小
            canvas.height = 100 * (img.height / img.width);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            var cdata = canvas.toDataURL("image/jpeg", quality);  //将图片转为Base64 之后预览要用
            _this.HeadUrl = cdata; //预览你压缩后的图片
            var newimglength = cdata.length;
            compresRadio = (((oldimglength - newimglength) / oldimglength * 100).toFixed(2)) + '%';
            image.src = _this.HeadUrl //预览压缩后的图片
        }
    }
})
