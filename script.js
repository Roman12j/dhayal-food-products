const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-block small");
const productButtons = document.querySelectorAll(".product-card button");
let count = 0;
let total = 0;

productButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const priceText = button.parentElement.querySelector("strong").textContent.replace(/[^0-9.]/g, "");
    count += 1;
    total += Number(priceText || 0);
    cartCount.textContent = count;
    cartTotal.textContent = `₹${total.toFixed(2)}`;
  });
});

document.querySelectorAll(".slider-arrow, .product-next").forEach((button) => {
  button.addEventListener("click", () => {
    button.animate([
      { transform: "scale(1)" },
      { transform: "scale(0.9)" },
      { transform: "scale(1)" }
    ], { duration: 180, easing: "ease-out" });
  });
});
