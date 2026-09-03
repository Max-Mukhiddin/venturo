console.log("Articles frontend javascript file");

$(function () {
  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });

  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
  });

  $(".new-article-status").on("change", async function (e) {
    const id = e.target.id;
    const status = $(`#${id}.new-article-status`).val();

    try {
      const response = await axios.post(`/admin/article/${id}`, {
        status: status,
      });
      console.log("response:", response);
      const result = response.data;
      if (result.data) {
        $(".new-article-status").blur();
      } else alert("Article update failed!");
    } catch (err) {
      console.log(err);
      alert("Article update failed!");
    }
  });
});

function validateArticleForm() {
  const title = $(".article-title").val();
  const slug = $(".article-slug").val();
  const category = $(".article-category").val();
  const content = $(".article-content").val();
  const status = $(".article-status").val();

  if (
    title === "" ||
    slug === "" ||
    category === "" ||
    content === "" ||
    status === ""
  ) {
    alert("Please insert all details!");
    return false;
  } else return true;
}

function autoSlugHandler() {
  const title = $(".article-title").val();
  const slugField = $(".article-slug");

  if (!slugField.data("touched")) {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    slugField.val(slug);
  }
}

$(document).on("input", ".article-slug", function () {
  $(this).data("touched", true);
});
