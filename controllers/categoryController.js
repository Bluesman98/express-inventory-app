const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");

// Display list of allcategories.
exports.category_list = (req, res) => {
  Category.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_categorys) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("category_list", {
        Category: "category List",
        category_list: list_categorys,
      });
    });
};

// Display detail page for a specific category.
exports.category_detail = (req, res) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }, "name description").exec(
          callback
        );
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.category == null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

// Display category create form on GET.
exports.category_create_get = (req, res,next) => {
  res.render("category_form", { title: "Create Category" });
};

// Handle category create on POST.
exports.category_create_post = [

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

        // Create a item object with escaped and trimmed data.
        const category = new Category({
          name: req.body.name,
          description: req.body.description,
        });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories and genres for form.
          res.render("category_form", {
          title: "Create Category",
          name: req.body.name,
          description: req.body.description,
          errors: errors.array(),
          });
        

      return;
    }

    // Data from form is valid. Save item.
    category.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new item record.
      res.redirect(category.url);
    });
  },
];

// Display category delete form on GET.
exports.category_delete_get = (req, res) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect("/catalog/categories");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

// Handle category delete on POST.
exports.category_delete_post = (req, res) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
     categories_items(callback) {
        Item.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.categorys_items.length > 0) {
        // category has items. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete category",
          category: results.category,
          category_items: results.categories_items,
        });
        return;
      }
      // category has no items. Delete object and redirect to the list ofcategories.
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to category list
        res.redirect("/catalog/categories");
      });
    }
  );
};

// Display category update form on GET.
exports.category_update_get = (req, res) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.body.itemid).exec(callback);
      },
    },
    (err) => {
      if (err) {
        return next(err);
      }
      // Success
  
      // item has no items. Delete object and redirect to the list ofcategories.
      Item.findByIdAndRemove(req.body.itemid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to item list
        res.redirect("/catalog/categories");
      });
    }
  );
};

// Handle category update on POST.
exports.category_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: category update POST");
};
