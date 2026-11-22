const urlBase = 'http://localhost:8000/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function formatColor(color)
{
	if (!color || typeof color !== "string")
	{
		return "";
	}
	return color.trim().toLowerCase();
}

function validateColor(color)
{
	if (!color || typeof color !== "string")
	{
		return { isValid: false, error: "Color cannot be empty" };
	}
	let trimmed = color.trim();
	if (trimmed.length === 0)
	{
		return { isValid: false, error: "Color cannot be empty" };
	}
	if (!/^[a-zA-Z\s-]+$/.test(trimmed))
	{
		return { isValid: false, error: "Color contains invalid characters" };
	}
	return { isValid: true, error: "" };
}

function validateLoginForm(login, password)
{
	if (!login || typeof login !== "string" || login.trim() === "")
	{
		return { isValid: false, error: "Username is required" };
	}
	if (!password || typeof password !== "string" || password.trim() === "")
	{
		return { isValid: false, error: "Password is required" };
	}
	return { isValid: true, error: "" };
}

function parseCookie(cookieString)
{
	let parsed = { firstName: "", lastName: "", userId: -1 };
	if (!cookieString || typeof cookieString !== "string")
	{
		return parsed;
	}
	let splits = cookieString.split(",");
	for (let i = 0; i < splits.length; i++)
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if (tokens[0] === "firstName")
		{
			parsed.firstName = tokens[1] || "";
		}
		else if (tokens[0] === "lastName")
		{
			parsed.lastName = tokens[1] || "";
		}
		else if (tokens[0] === "userId")
		{
			parsed.userId = parseInt(tokens[1] ? tokens[1].trim() : "-1", 10);
		}
	}
	return parsed;
}

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let validation = validateLoginForm(login, password);
	if (!validation.isValid)
	{
		document.getElementById("loginResult").innerHTML = validation.error;
		return;
	}

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	let parsed = parseCookie(document.cookie);
	firstName = parsed.firstName;
	lastName = parsed.lastName;
	userId = parsed.userId;
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let validation = validateColor(newColor);
	if (!validation.isValid)
	{
		document.getElementById("colorAddResult").innerHTML = validation.error;
		return;
	}

	let tmp = {color:newColor,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddColor.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
	
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchColors.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
	
}

if (typeof module !== "undefined" && module.exports)
{
	module.exports = {
		formatColor,
		validateColor,
		validateLoginForm,
		parseCookie,
		doLogin,
		saveCookie,
		readCookie,
		doLogout,
		addColor,
		searchColor
	};
}
