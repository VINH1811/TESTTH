function themYeuThich(idTour){
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    
    if(!favs.includes(idTour)){
        favs.push(idTour);
        localStorage.setItem("favorites", JSON.stringify(favs));
        alert("Đã thêm vào yêu thích!");
    }
}


function layDanhSachYeuThich(){
    return JSON.parse(localStorage.getItem("favorites")) || [];
}


function hienThiYeuThich(){
    let favs = layDanhSachYeuThich();

    $.get("https://692b135b7615a15ff24ea9d3.mockapi.io/tours", function(data){
        let list = data.filter(t => favs.includes(t.id));
        console.log(list); // Hiển thị ra
    });
}


function xoaYeuThich(idTour){
    let favs = layDanhSachYeuThich();
    favs = favs.filter(id => id !== idTour);
    localStorage.setItem("favorites", JSON.stringify(favs));
}
