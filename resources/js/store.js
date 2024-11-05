$(function() {
    init();
});

function init() {
    // 상품 정보 로드
    var products = [];
    getProducts(function(datas) {
        products = datas;
        products.forEach(function(product, index) {
            appendProduct(product, index);
        });
    });

    // Drop 영역 설정
    $('#drop-area').droppable({
        drop: function(event, ui) {
            var item = $(ui.draggable);
            var index = item.attr('data-index');
            var img = item.find('img');
            var productName = item.find('.product-name').text();
            var brandName = item.find('.brand-name').text();
            var price = parseInt(item.find('.price').text().replace(',', ''), 10);

            // 상품 원위치 시키기
            item.css({
                position: 'relative',
                top: 'auto',
                left: 'auto'
            });

            var productInBasket = $(`#basket-list [data-index=${index}]`);
            if (productInBasket.length) {
                // 중복되는 상품이 있을 경우
                alert('이미 장바구니에 담긴 상품입니다.');
                return;
            }

            var newItem = $(`
            <div class="card-deck">
                <div class="card mb-3" style="max-width: 540px;" data-index="${index}">
                    <div class="row no-gutters">
                        <div class="col-md-4 overflow-hidden">
                            <img src="${img.attr('src')}" class="card-img h-100 w-auto" alt="${productName}" title="${productName}">
                        </div>
                        <div class="col-md-7">
                            <div class="card-body">
                            <h5 class="card-title product-name">${productName}</h5>
                            <p class="card-text brand-name">${brandName}</p>
                            <p class="card-text"><small class="text-muted price">${price.toLocaleString()}</small></p>
                            <p class="card-text">
                                <div class="input-group input-group-sm mb-3">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text" id="inputGroup-sizing-sm-${index}">수량</span>
                                    </div>
                                    <input type="number" min="1" value="1" class="form-control number" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm-${index}">
                                </div>
                            </p>
                            <p class="card-text">합계 <span class="sum">${price.toLocaleString()}</span>원</p>
                            </div>
                        </div>
                        <button type="button" class="col-md-1 btn-delete">X</button>
                    </div>
                </div>
            </div>
            `);

            newItem.find("input[type='number']").on('keyup change', function() {
                var sum = price * $(this).val();
                newItem.find('.sum').text(sum.toLocaleString());

                setTotalSum();
            });

            newItem.find('button.btn-delete').on('click', function() {
                newItem.remove();
                setTotalSum();
            });

            $('#basket-list').append(newItem);
            setTotalSum();
        }
    });
}

function setTotalSum() {
    var totalSum = 0;

    $('#basket-list .sum').each(function() {
        totalSum += parseInt($(this).text().replace(',', ''), 10);
    });

    $('#total-sum').text(totalSum.toLocaleString());
}

function getProducts(cb) {
    $.ajax({
        url: 'resources/json/store.json',
        success: function(datas) {
            cb(datas);
        }
    });
}

function appendProduct(product, index) {
    var newItem = $(`
        <div class="col-4 mb-3">
            <div class="store-item" data-index="${index}">
                <img src="resources/images/${product.photo}" class="card-img-top" alt="${product.product_name}" title="${product.product_name}">
                <div class="card-body">
                    <h5 class="card-title product-name">${product.product_name}</h5>
                    <p class="card-text brand-name">${product.brand}</p>
                </div>
                <div class="card-footer">
                    <small class="text-muted price">${product.price}</small>
                </div>
            </div>
        </div>
    `);
    
    newItem.find('> div').draggable({
        zIndex: 999,
        revert: 'invalid'
    });

    $('#product-list').append(newItem);
}

function openBuyPopup() {
    // 팝업 (구매자 이름, 주소, 구매 완료 버튼)
    $('#popup-buy').dialog({
        width: 350,
        height: 250,
        modal: true,
        buttons: {
            '구매 완료': function() {
                var name = $('#name').val();
                var address = $('#address').val();

                // if (!name) {
                //     alert('이름을 입력해주세요.');
                //     return;
                // }

                // if (!address) {
                //     alert('주소를 입력해주세요.');
                //     return;
                // }

                if (!name || !address) {
                    alert('모든 필드를 입력해주세요.');
                    return;
                }

                $(this).dialog('close');
                buy();
            },
            '닫기': function() {
                $(this).dialog('close');
            }
        },
        open: function(event) {
            $(event.target).dialog('widget')
                .css({
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                });
        }
    })
}

function buy() {
    // 구매 내역에 대한 이미지 보여주기
    openReceiptPopup();
    // 장바구니 비워주기
    $('#basket-list').html('');
    setTotalSum();
}

function openReceiptPopup() {
    var cvs = $('#receipt');
    var ctx = cvs[0].getContext('2d');
    var itemLen = $('#basket-list > div').length;

    cvs.attr({
        width: 300,
        height: 200 + (120 * itemLen)
    });

    // 구매 내역 (타이틀)
    ctx.font = 'bold 20px Margun Gothic';
    ctx.fillStyle = 'black';
    ctx.fillText('구매 내역', 10, 20);

    // 구매 일시
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDay();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var datetime = `${year}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
    ctx.font = 'bold 14px Malgun Gothic';
    ctx.fillText(datetime, 10, 50);

    // 상품별 정보(상품명, 브랜드, 가격, 수량, 합계)
    console.log($('#basket-list > div').length);
    $('#basket-list > div').each(function(i) {
        var productName = $(this).find('.product-name').text();
        var brandName = $(this).find('.brand-name').text();
        var price = $(this).find('.price').text();
        var number = $(this).find('.number').val();
        var sum = $(this).find('.sum').text();
        
        ctx.fillText(productName, 10, 120 * (i + 1));
        ctx.fillText(`- 브랜드 : ${brandName}`, 10, 120 * (i + 1) + 20);
        ctx.fillText(`- 가격 : ${price}`, 10, 120 * (i + 1) + 40);
        ctx.fillText(`- 수량 : ${number}`, 10, 120 * (i + 1) + 60);
        ctx.fillText(`- 합계 : ${sum}`, 10, 120 * (i + 1) + 80);
    });

    // 총 합계
    var totalSum = $('#total-sum').text();
    ctx.fillText(`총 합계 : ${totalSum}`, 10, 120 * itemLen + 150);

    // 구매 내역에 대한 이미지를 담고있는 팝업 생성
    $('#popup-receipt').dialog({
        width: 500,
        height: 500,
        modal: true,
        buttons: {
            '닫기': function() {
                $(this).dialog('close');
            }
        },
        open: function(event) {
            $(event.target).dialog('widget')
                .css({
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                });
        }
    });
}

function onSearch(value) {
    var resultCount = 0;

    $('#product-list > div').each(function() {
        var productName = $(this).find('.product-name');
        var brandName = $(this).find('.brand-name');

        if (value === '') {
            $(this).show();
            $('#msg-empty').hide();
        } else {
            $(this).hide();
        }

        // 상품명에 일치할 경우
        if (productName.text().indexOf(value) !== -1) {
            var pnHighlight = productName.text().replace(value, `<span class='highlight'>${value}</span>`);
            productName.html(pnHighlight);
            $(this).show();
            resultCount += 1; // resultCount = resultCount + 1;
        }

        // 브랜드명에 일치할 경우
        if (brandName.text().indexOf(value) !== -1) {
            var bnHighlight = brandName.text().replace(value, `<span class='highlight'>${value}</span>`);
            brandName.html(bnHighlight);
            $(this).show();
            resultCount += 1;
        }
    });

    if (resultCount === 0) {
        $('#msg-empty').show();
    } else {
        $('#msg-empty').hide();
    }
}