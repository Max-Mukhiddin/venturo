console.log("Products frontend javascript file");

$(function () {
  let products = [];
  try {
    const productData = document.getElementById("product-edit-data");
    products = productData ? JSON.parse(productData.textContent || "[]") : [];
  } catch (err) {
    console.log("Unable to load product edit data:", err);
  }

  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });

  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
  });

  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id;
    const productStatus = $(`#${id}.new-product-status`).val();

    try {
      const response = await axios.post(`/admin/product/${id}`, {
        productStatus: productStatus,
      });
      console.log("response:", response);
      const result = response.data;
      if (result.data) {
        $(".new-product-status").blur();
      } else alert("Product update failed!");
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });

  $(".product-edit-button").on("click", function () {
    const productId = String($(this).data("product-id"));
    const product = products.find((item) => String(item._id) === productId);
    if (!product) {
      alert("Product update failed!");
      return;
    }

    $("#product-edit-form").data("product-id", productId);
    $("#edit-product-name").val(product.productName || "");
    $("#edit-product-collection").val(product.productCollection || "");
    $("#edit-product-size").val(product.productSize || "");
    $("#edit-product-price").val(product.productPrice);
    $("#edit-product-left-count").val(product.productLeftCount);
    $("#edit-product-desc").val(product.productDesc || "");
    $("#edit-product-status").val(product.productStatus || "");
    $("#product-edit-modal").prop("hidden", false);
  });

  const closeEditModal = () => {
    $("#product-edit-modal").prop("hidden", true);
    $("#product-edit-form").removeData("product-id");
  };

  $("#edit-product-cancel, #edit-product-close").on("click", closeEditModal);
  $("#product-edit-modal").on("click", function (event) {
    if (event.target === this) closeEditModal();
  });

  $("#product-edit-form").on("submit", async function (event) {
    event.preventDefault();

    const productId = $(this).data("product-id");
    const productName = String($("#edit-product-name").val() || "").trim();
    const productCollection = $("#edit-product-collection").val();
    const productSize = $("#edit-product-size").val();
    const priceValue = String($("#edit-product-price").val() || "").trim();
    const inventoryValue = String($("#edit-product-left-count").val() || "").trim();
    const productPrice = Number(priceValue);
    const productLeftCount = Number(inventoryValue);
    const productDesc = String($("#edit-product-desc").val() || "").trim();
    const productStatus = $("#edit-product-status").val();

    if (
      !productId ||
      !productName ||
      !productCollection ||
      !priceValue ||
      !Number.isFinite(productPrice) ||
      productPrice < 0 ||
      !inventoryValue ||
      !Number.isFinite(productLeftCount) ||
      productLeftCount < 0 ||
      !productDesc ||
      !productStatus
    ) {
      alert("Please insert valid product details!");
      return;
    }

    try {
      const response = await axios.post(`/admin/product/${productId}`, {
        productName,
        productCollection,
        productSize: productSize || null,
        productPrice,
        productLeftCount,
        productDesc,
        productStatus,
      });

      if (response.data?.data) {
        closeEditModal();
        window.location.reload();
      } else {
        alert("Product update failed!");
      }
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });
});

function validateForm() {
  const productName = $(".product-name").val();
  const productPrice = $(".product-price").val();
  const productLeftCount = $(".product-left-count").val();
  const productCollection = $(".product-collection").val();
  const productDesc = $(".product-desc").val();
  const productStatus = $(".product-status").val();

  if (
    productName === "" ||
    productPrice === "" ||
    productLeftCount === "" ||
    productCollection === "" ||
    productDesc === "" ||
    productStatus === ""
  ) {
    alert("Please insert all details!");
    return false;
  } else return true;
}

function previewFileHandler(input, order) {
  const imgClassName = input.className;
  console.log("input:", input);

  const file = $(`.${imgClassName}`).get(0).files[0];
  const fileType = file["type"];
  const validImageType = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpeg, jpg, webp and png");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
