function ProductTable(props) {
  const productRows = props.products.map(product => //id is taken as key value which uniquely identifies a row.
  React.createElement(ProductRow, {
    Key: product.id,
    product: product
  }));
  return React.createElement("table", {
    className: "bordered-table"
  }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
    className: "color1"
  }, "Product Name"), React.createElement("th", {
    className: "color2"
  }, "Price"), React.createElement("th", {
    className: "color1"
  }, "Category"), React.createElement("th", {
    className: "color2"
  }, "Image"))), React.createElement("tbody", null, productRows));
}

function ProductRow(props) {
  const product = props.product;
  return React.createElement("tr", null, React.createElement("td", null, product.productname), React.createElement("td", null, "$", product.price), React.createElement("td", null, product.category), React.createElement("td", null, React.createElement("a", {
    href: product.image,
    target: "_blank"
  }, "View")));
}

class ProductAdd extends React.Component {
  constructor() {
    super(); //pre-populating the $ symbol

    this.state = {
      value: '$'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  } // To read the price value using onChange.


  handleChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.productAdd;
    const product = {
      productname: form.productname.value,
      price: form.price.value,
      category: form.category.value,
      image: form.image.value
    };
    this.props.createProduct(product);
    form.productname.value = "";
    form.price.value = "";
    form.category.value = "";
    form.image.value = "";
  }

  render() {
    return React.createElement("form", {
      name: "productAdd",
      onSubmit: this.handleSubmit
    }, React.createElement("div", null, React.createElement("div", {
      className: "fleft"
    }, React.createElement("label", null, "Category"), React.createElement("br", null), React.createElement("select", {
      name: "category"
    }, React.createElement("option", null, "Shirts"), React.createElement("option", null, "Jeans"), React.createElement("option", null, "Jackets"), React.createElement("option", null, "Sweaters"), React.createElement("option", null, "Accessories"))), React.createElement("div", {
      className: "fleft"
    }, React.createElement("label", null, "Price Per Unit"), React.createElement("br", null), React.createElement("input", {
      type: "text",
      name: "price",
      value: this.state.value,
      onChange: this.handleChange
    })), React.createElement("div", {
      className: "fleft"
    }, React.createElement("label", null, "ProductName"), React.createElement("br", null), React.createElement("input", {
      type: "text",
      name: "productname"
    })), React.createElement("div", {
      className: "fleft"
    }, React.createElement("label", null, "Image Url"), React.createElement("br", null), React.createElement("input", {
      type: "url",
      name: "image"
    })), React.createElement("div", null, React.createElement("button", {
      className: "color3"
    }, "Add Product"))));
  }

}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];

      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }

    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class ProductList extends React.Component {
  constructor() {
    super(); //assigning an empty array to the products state variable.

    this.state = {
      products: []
    }; // bind() method helps in passing eventhandlers and other functions as props to the child component.

    this.createProduct = this.createProduct.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    // constructing a GraphQL query
    const query = `query{
      productList{
          id productname price 
		  category image

      }
    }`;
    const data = await graphQLFetch(query);

    if (data) {
      this.setState({
        products: data.productList
      });
    }
  } //method to add a new product


  async createProduct(product) {
    const query = `mutation productAdd($product: ProductInputs!) {
      productAdd(product: $product) {
        id
      }
    }`;
    const data = await graphQLFetch(query, {
      product
    });

    if (data) {
      this.loadData();
    }
  }

  render() {
    return React.createElement(React.Fragment, null, React.createElement("h1", null, "My Company Inventory"), React.createElement("p", null, "Showing all available products"), React.createElement("hr", null), React.createElement(ProductTable, {
      products: this.state.products
    }), React.createElement("p", null, "Add a new product to inventory"), React.createElement("hr", null), React.createElement(ProductAdd, {
      createProduct: this.createProduct
    }));
  }

}

const element = React.createElement(ProductList, null);
ReactDOM.render(element, document.getElementById('contents'));