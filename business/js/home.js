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
        // renderPayOrderDetail($(event.target).siblings('input').val())
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
})
