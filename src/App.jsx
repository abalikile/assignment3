function ProductTable(props){
  const productRows =props.products.map(product =>
	  //id is taken as key value which uniquely identifies a row.
	  <ProductRow Key={product.id}  product={product}  />
  );
  return(
	<table className = "bordered-table">
		<thead>
		   <tr>
				<th className="color1">Product Name</th>
				<th className="color2">Price</th>
				<th className="color1">Category</th>
				<th className="color2">Image</th>
			</tr>
		</thead>
		<tbody>
			{productRows}
		</tbody>
	</table>
    );
}
 
function ProductRow (props){
	const product = props.product;
	return(
	<tr>
		<td>{product.productname}</td>
		<td>${product.price}</td>
		<td>{product.category}</td>
		<td><a href={product.image} target="_blank">View</a></td>
    </tr>											
    );
}
  
class ProductAdd extends React.Component{
	constructor(){
		super();
		//pre-populating the $ symbol
		this.state = {value:'$'};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}


	// To read the price value using onChange.
    handleChange(e){
		this.setState({value: e.target.value});
	}
	handleSubmit(e){
		e.preventDefault();
		const form = document.forms.productAdd;

		const product = {
			productname: form.productname.value,  price: form.price.value, category: form.category.value, image: form.image.value,
		}
		this.props.createProduct(product);
		form.productname.value = ""; form.price.value = ""; form.category.value = ""; form.image.value = "";
	}

	render(){
		return(
		<form name="productAdd" onSubmit={this.handleSubmit}>
			<div>
				<div className="fleft">
					<label >Category</label><br />
					<select name="category">
						<option>Shirts</option>
						<option>Jeans</option>
						<option>Jackets</option>
						<option>Sweaters</option>
						<option>Accessories</option>
					</select>
				</div>

				<div className="fleft">
					<label>Price Per Unit</label><br />
					<input type="text"   name="price" value={this.state.value} onChange={this.handleChange} />
				</div>

				<div className="fleft">
					<label  >ProductName</label><br />
					<input type="text" name="productname" />
				</div>
				 
				<div className="fleft">
					<label >Image Url</label><br/>
					<input type="url" name="image" />
				</div>


				<div>
					<button className="color3">Add Product</button>
				</div>
			</div>
		</form>
		);
		}
	}


async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
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


class ProductList extends React.Component{
	constructor(){
	super();
	//assigning an empty array to the products state variable.
	this.state = { products:[]};
	// bind() method helps in passing eventhandlers and other functions as props to the child component.
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
      this.setState({ products: data.productList });
    }
  }
	
	//method to add a new product
  async createProduct(product) {
    const query = `mutation productAdd($product: ProductInputs!) {
      productAdd(product: $product) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { product });
    if (data) {
      this.loadData();
    }
  }

	render(){
	return(
	<React.Fragment>
	<h1>My Company Inventory</h1>
	<p>Showing all available products</p>
	<hr/>
	<ProductTable  products={this.state.products}/>
	<p>Add a new product to inventory</p>
	<hr />
	<ProductAdd  createProduct = {this.createProduct}/>{/*passing createProduct() method itself as a part of props.*/}
	</React.Fragment>
	);
	}
}

const element = <ProductList />;
ReactDOM.render(element, document.getElementById('contents'));