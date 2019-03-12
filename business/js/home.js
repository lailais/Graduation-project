$(()=>{
    var unCookList = []
    var currentOrderList = []
    var bSelected = []
    var subTotal = 0
    var payOrderList = []

    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/unpayList',
        dataType: "json",
        success: function (list) {
            updataList(list.unpayList)
            console.log(unCookList)
            console.log(currentOrderList)
            renderUncookList(unCookList)
            renderUnpayList(currentOrderList)
        },
        error: function (data) {
            console.log('error')
        }
    })

    var socket = io.connect('http://localhost:3000/')
    socket.on('fromcSeleted', function (list) {
        unCookList = [] // 置空
        currentOrderList = []
        updataList(list.unpayList)
        console.log(unCookList)
        console.log(currentOrderList)
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
        renderSubOrderDetail($(event.currentTarget).attr('deskId'),$(event.currentTarget).attr('subOrderListId'))
    })
    $('#subOrderDetail > div.close').click((event)=>{
        $(event.target).parent('#subOrderDetail').hide()
        renderBtn(false)
    })
    $('#subOrderDetail > div.btn-container > span.change-btn.btn').click((event)=>{
        renderBtn(true)
        $('#subOrderDetail > div.subOrderDetail-container > table > tbody > tr span ').css('display','inline-block')
    })
    $('#subOrderDetail > div.btn-container > span.cancel-btn.btn').click((event)=>{
        renderBtn(false)
        $('#subOrderDetail > div.subOrderDetail-container > table > tbody > tr span ').hide()
    })
    $('#subOrderDetail > div.btn-container > span.confirm-btn.btn').click((event)=>{
        renderBtn(false)
        $('#subOrderDetail > div.subOrderDetail-container > table > tbody > tr span ').hide()
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
        renderUnpayOrderDetail($(event.currentTarget).attr('deskId'))
    })
    $('#unpayOrderDetail').on('click', '.close', ()=>{
    $('#unpayOrderDetail').hide()
    })

    //show payList
    $('.payList').on('click', (event)=>{
        console.log('ccc')
        console.log(event.target)
    })
    $('.orderList').on('click','.payList.list > div > ul > li', (event)=>{
        renderPayOrderDetail($(event.currentTarget).attr('orderId'))
        console.log($(event.currentTarget).attr('orderId'))
    })
    $('#payOrderDetail').on('click', '.close', ()=>{
        $('#payOrderDetail').hide()
    })

    //click shopInfo btn ,show shopList
    $('.shop-info').click(()=> {
        $('.orderList').hide()
        $('.order-info').removeClass('active')
        $('.shopList').show()
        $('.shop-info').addClass('active')
    })

    //click orderList btn ,show orderList
    $('.order-info').click(()=> {
        $('.orderList').show()
        $('.order-info').addClass('active')
        $('.shopList').hide()
        $('.shop-info').removeClass('active')
    })

    function updataList(cSelected) { // 更新已选择列表
        for (let i = 0; i < cSelected.length; i++) {
            for (let j = 0; j < cSelected[i].shopList.length; j++) {
                // console.log(cSelected[i].shopList[j])
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
                                <span class="cook-btn btn">结账</span>
                            </div>
                        </li>`
        }
        $('.unpayList .unpayList-ul').html(x)
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
                <td><span>-</span>${unCookList[i].subShopList[j].name}</td>
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
                <h3 class="subOrderListId">清单号：${shopList.subOrderListId}</h3>
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

    function renderPayOrderDetail(orderId) {
        let x = ''
        x += `
         <h2 class="orderId">订单号：${orderId}</h2>
        <h2 class="checkout-time">结账时间：2018.03.04</h2>
        <h2 class="deskId">桌号：03</h2>
        <ul>
            <li>
                <h3 class="subOrderListId">清单号：02</h3>
                <table cellspacing="0" cellpadding="0" border="0">
                    <tr align="center">
                        <td width="60">id</td>
                        <td>菜名</td>
                        <td  width="50">单价</td>
                        <td  width="60">数量</td>
                        <td  width="50">小计</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">2423442</td>
                        <td>ggdfgsd</td>
                        <td  width="50">6</td>
                        <td  width="60">4</td>
                        <td  width="50">677</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">654643</td>
                        <td>gdfggdfg</td>
                        <td  width="50">6</td>
                        <td  width="60">5</td>
                        <td  width="50">67457</td>
                    </tr>
                </table>
                <div class="sub-total">清单小结：535</div>
            </li>
            <li>
                <h3 class="subOrderListId">清单号：02</h3>
                <table cellspacing="0" cellpadding="0" border="0">
                    <tr align="center">
                        <td width="60">id</td>
                        <td>菜名</td>
                        <td  width="50">单价</td>
                        <td  width="60">数量</td>
                        <td  width="50">小计</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">2423442</td>
                        <td>ggdfgsd</td>
                        <td  width="50">6</td>
                        <td  width="60">4</td>
                        <td  width="50">677</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">654643</td>
                        <td>gdfggdfg</td>
                        <td  width="50">6</td>
                        <td  width="60">5</td>
                        <td  width="50">67457</td>
                    </tr>
                </table>
                <div class="sub-total">清单小结：535</div>
            </li>
            <li>
                <h3 class="subOrderListId">清单号：02</h3>
                <table cellspacing="0" cellpadding="0" border="0">
                    <tr align="center">
                        <td width="60">id</td>
                        <td>菜名</td>
                        <td  width="50">单价</td>
                        <td  width="60">数量</td>
                        <td  width="50">小计</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">2423442</td>
                        <td>ggdfgsd</td>
                        <td  width="50">6</td>
                        <td  width="60">4</td>
                        <td  width="50">677</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">654643</td>
                        <td>gdfggdfg</td>
                        <td  width="50">6</td>
                        <td  width="60">5</td>
                        <td  width="50">67457</td>
                    </tr>
                </table>
                <div class="sub-total">清单小结：535</div>
            </li>
            <li>
                <h3 class="subOrderListId">清单号：02</h3>
                <table cellspacing="0" cellpadding="0" border="0">
                    <tr align="center">
                        <td width="60">id</td>
                        <td>菜名</td>
                        <td  width="50">单价</td>
                        <td  width="60">数量</td>
                        <td  width="50">小计</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">2423442</td>
                        <td>ggdfgsd</td>
                        <td  width="50">6</td>
                        <td  width="60">4</td>
                        <td  width="50">677</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">654643</td>
                        <td>gdfggdfg</td>
                        <td  width="50">6</td>
                        <td  width="60">5</td>
                        <td  width="50">67457</td>
                    </tr>
                </table>
                <div class="sub-total">清单小结：535</div>
            </li>
            <li>
                <h3 class="subOrderListId">清单号：02</h3>
                <table cellspacing="0" cellpadding="0" border="0">
                    <tr align="center">
                        <td width="60">id</td>
                        <td>菜名</td>
                        <td  width="50">单价</td>
                        <td  width="60">数量</td>
                        <td  width="50">小计</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">2423442</td>
                        <td>ggdfgsd</td>
                        <td  width="50">6</td>
                        <td  width="60">4</td>
                        <td  width="50">677</td>
                    </tr>
                    <tr align="center">
                        <td  width="60">654643</td>
                        <td>gdfggdfg</td>
                        <td  width="50">6</td>
                        <td  width="60">5</td>
                        <td  width="50">67457</td>
                    </tr>
                </table>
                <div class="sub-total">清单小结：535</div>
            </li>
        </ul>
        <div class="total">总计：5345</div>
        `
        $('#payOrderDetail>.payOrderDetail-container').html(x)
        $('#payOrderDetail').show()
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
        let newCount = ''
        let newSubTotal = ''
        let newTotal = ''
        if(type === 0) {
             newCount = ++oldCount
             newSubTotal = oldSubTotal + price
             newTotal = oldTotal + price
        } else if(type === 1) {
             newCount = --oldCount
             newSubTotal = oldSubTotal - price
             newTotal = oldTotal - price
        } else if(type === 2) {
            newCount = 0
            newTotal = oldTotal - oldSubTotal
        }

        if(newCount === 0){
            $(event.target).parents('tbody').find($(event.target).parent('td').parent('tr')).remove()
            $('#subOrderDetail>.subOrderDetail-container>.subtotal').text(`小计：${newTotal}`)
            return
        }
        $(event.target).siblings('.text').text(newCount)
        $(event.target).parents('tr').find('td:nth-child(4)').text(newSubTotal)
        $('#subOrderDetail>.subOrderDetail-container>.subtotal').text(`小计：${newTotal}`)
    }
})