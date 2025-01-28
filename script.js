
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const suggestion1 = document.querySelectorAll("#platform_now");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
 
let userMessage = null;
let isResponseGenerating = false;


const API_KEY = "AIzaSyCjQdmO3pHKlbNoUNhCpWCU_fsnCIPl_FE"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

 
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

  
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

   
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);

  chatContainer.scrollTo(0, chatContainer.scrollHeight);  
}

 
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

 
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);  
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);  
  }, 75);
}

 // ================================================================================== //


 // ================================================================================== //


 
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");  
  
   
  const nameQuestions = [
    "what is your name",
    "who are you",
    "what's your name",
    "can you tell me your name",
    "who you are",
    "what do they call you",
    "may i know your name",
    "tell me your name",
    "your name please",
    "what are you called",
    "your name",
    "your name is",
    "what people called you",
    "how are you",
    "do you know your name"
  ];

  const normalizedMessage = userMessage.toLowerCase().trim();
  const isNameQuestion = nameQuestions.some(question => normalizedMessage.includes(question));

  if (isNameQuestion) {
    
    setTimeout(() => {
      textElement.innerText = "I am Go-Alpha.";  
      incomingMessageDiv.classList.remove("loading");
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      isResponseGenerating = false;
      localStorage.setItem("saved-chats", chatContainer.innerHTML);  
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }, 1000);  
    return;  
  }

  try {
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          role: "user", 
          parts: [{ text: userMessage }] 
        }] 
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

     
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);  
  } catch (error) {  
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};


 
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="chat_icon.png" alt="User avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                     <p style='color:gray; text-weight:bold;'> Go-Alpha will generate your requested information now ...... </p>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);

  chatContainer.scrollTo(0, chatContainer.scrollHeight);  
  generateAPIResponse(incomingMessageDiv);
}

 
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";  
  setTimeout(() => copyButton.innerText = "content_copy", 1000);  
}

 
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  
 
  const multiLanguagePattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s.,?!]+$/; // Allows Arabic and English characters
  if (!multiLanguagePattern.test(userMessage)) {
    Swal.fire({
      title: "Language Error",
      text: "Go-Alpha v.1 supports only Arabic and English languages. Please enter your message in one of these languages.",
      icon: "error",
      confirmButtonText: "Close",
    });
    return; 
  }

  if(!userMessage || isResponseGenerating) return;  

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <img class="avatar" src="user.png" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);
  
  typingForm.reset();  
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight);  
  setTimeout(showLoadingAnimation, 500);  
}

 
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});


deleteChatButton.addEventListener("click", () => {

  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete the generated information?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "All generated information has been deleted.",
        icon: "success"
      });
      localStorage.removeItem("saved-chats");
      loadDataFromLocalstorage();
    }

   
  });
 
});

 
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

 
 
typingForm.addEventListener("submit", (e) => {
  e.preventDefault(); 
  handleOutgoingChat();
});

loadDataFromLocalstorage();




/*============================== Download PDF =====================================*/

document.getElementById("saveChatPdf").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;  
  const doc = new jsPDF({
      orientation: "portrait",  
      unit: "mm",  
      format: "a4"  
  });

   
  const margin = 20;  
  const lineHeight = 10;  
  const pageHeight = doc.internal.pageSize.height;  
  const pageWidth = doc.internal.pageSize.width;  
  let y = margin;  

   
  const addWatermark = () => {
      doc.setFontSize(15);  
      doc.setTextColor(200, 200, 200);  
      doc.text("This is a generated information paper by Go-Alpha", pageWidth / 2, pageHeight / 30, {
          align: "center",
          angle: 0  
      });
  };

   
  addWatermark();

   
  const messages = document.querySelectorAll(".chat-list .message .text");

  messages.forEach((message) => {
      const text = message.innerText;
      const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);  
      splitText.forEach((line, index) => {
          
          if (y + lineHeight > pageHeight - margin) {
              doc.addPage();  
              addWatermark(); 
              y = margin; 
          }

        
              doc.setFontSize(14);  
              doc.setTextColor(0, 0, 0);  
          

          doc.text(line, margin, y);  
          y += lineHeight;  
      });
  });

  doc.save("Go-Alpha.pdf");  
});




//================= generate a chart =========================//


 
const equalizerChatButton = document.getElementById("equalizer-chat-button");

equalizerChatButton.addEventListener("click", () => {
  const messages = document.querySelectorAll(".chat-list .message.incoming .text");
  
  if (messages.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "No Data!",
      text: "There is no generated data to convert into a chart.",
    });
    return;
  }

 
  const latestMessage = messages[messages.length - 1].innerText;
 
  const chartData = extractDataFromMessage(latestMessage);

  
  if (!chartData) {
    Swal.fire({
      icon: "error",
      title: "Invalid Data",
      text: "Could not extract chartable data from this response.",
    });
    return;
  }

   
  showChartPopup(chartData);
});

 
function extractDataFromMessage(message) {
  const dataRegex = /(\w+):\s*\$?([\d.]+)/g;  
  const labels = [];
  const values = [];
  let match;

  while ((match = dataRegex.exec(message)) !== null) {
    labels.push(match[1]);
    values.push(parseFloat(match[2]));
  }

   
  if (labels.length === 0 || values.length === 0) return null;

  return { labels, values };
}

 
function showChartPopup({ labels, values }) {
  Swal.fire({
    title: "Go-Alpha Generated Chart",
    html: `
      <canvas id="chartCanvas" style="width:100%; max-height:400px;"></canvas>
      <button id="downloadChartPdf" style="margin-top: 15px; padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Download Chart as PDF
      </button>
    `,
    width: 800,
    showCloseButton: true,
    showConfirmButton: false,
    didOpen: () => {
      const ctx = document.getElementById("chartCanvas").getContext("2d");

       
      const chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Values",
              data: values,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `$${context.raw.toFixed(2)}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        },
      });

      
      document.getElementById("downloadChartPdf").addEventListener("click", () => {
        downloadChartAsPdf(chart);
      });
    },
  });
}

 
function downloadChartAsPdf(chart) {
  const { jsPDF } = window.jspdf;

   
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  
  html2canvas(chart.canvas).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");  
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;  

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);  
    pdf.save("Go-Alpha chart.pdf");  
  });
}





// =============================== excel format ============================= //

 
document.getElementById("excel-sheet-button").addEventListener("click", async () => {
  const apiResponse = await fetchDataFromGeminiAPI();

  if (apiResponse) {
    const parsedData = formatResponseData(apiResponse);  

    if (parsedData.length > 0) {
      Swal.fire({
        title: "Download Data in Excel Format?",
        text: "Note: the downloaded excel file will be different than generated item for making a variety of information so the excel file will include same structure of information but in different context ",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
          downloadExcel(parsedData);
          Swal.fire({
            title: "Downloaded!",
            text: "The data has been downloaded in Excel format.",
            icon: "success",
            confirmButtonText: "Close",
          });
        }
      });
    } else {
      Swal.fire({
        title: "No Data",
        text: "The API response did not contain any usable data to download.",
        icon: "info",
        confirmButtonText: "Close",
      });
    }
  } else {
    Swal.fire({
      title: "Error",
      text: "No data was generated from Go-Alpha.",
      icon: "error",
      confirmButtonText: "Close",
    });
  }
});

 
const fetchDataFromGeminiAPI = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

     
    return data.candidates[0]?.content?.parts[0]?.text || null;
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    return null;
  }
};

 
const formatResponseData = (responseText) => {
  
  const formattedData = [];
  const lines = responseText.split("\n");

  lines.forEach((line, index) => {
    if (line.trim()) {
      formattedData.push({ Line: index + 1, Content: line.trim() });
    }
  });

  return formattedData;  
};

 
const downloadExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "GeneratedData");
  XLSX.writeFile(workbook, "Go-Alpha Sheet.xlsx");
};







// ======================= Blockchain Generation  ======================================== //
 
 
document.getElementById("network-node-button").addEventListener("click", () => {
  Swal.fire({
    title: 'Do you want to generate your blockchain key information?',
    text: 'This will open the blockchain details page.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, generate it!',
    cancelButtonText: 'No, cancel',
  }).then((result) => {
    if (result.isConfirmed) {
       
      window.location.href = "blockchain.html";

    }
  });
});


// ========= Stock price information and its prediction ========================== //

document.getElementById("trending-up-button").addEventListener("click", () => {
  Swal.fire({
    title: "Select a Company",
    html: `
      <select id="company-select" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        <option value="">Choose a company...</option>
        <option value="AAPL">Apple (AAPL)</option>
        <option value="MSFT">Microsoft (MSFT)</option>
        <option value="GOOGL">Alphabet (GOOGL)</option>
        <option value="AMZN">Amazon (AMZN)</option>
        <option value="TSLA">Tesla (TSLA)</option>
        <option value="META">Meta (META)</option>
        <option value="NVDA">NVIDIA (NVDA)</option>
        <option value="NFLX">Netflix (NFLX)</option>
        <option value="AMD">AMD (AMD)</option>
        <option value="INTC">Intel (INTC)</option>
        <option value="CSCO">Cisco (CSCO)</option>
        <option value="ORCL">Oracle (ORCL)</option>
        <option value="ADBE">Adobe (ADBE)</option>
        <option value="CRM">Salesforce (CRM)</option>
        <option value="PYPL">PayPal (PYPL)</option>
        <option value="QCOM">Qualcomm (QCOM)</option>
        <option value="IBM">IBM (IBM)</option>
        <option value="TXN">Texas Instruments (TXN)</option>
        <option value="SHOP">Shopify (SHOP)</option>
        <option value="SPOT">Spotify (SPOT)</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: "Get Stock Info",
    footer: `
      <button id="predict-stock-price" 
              style="
                padding: 10px 20px; 
                background-color: #3085d6; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;">
        Predict Stock Price
      </button>
    `,
    didRender: () => {
      document.getElementById("predict-stock-price").addEventListener("click", () => {
        const selectedCompany = document.getElementById("company-select").value;
        if (!selectedCompany) {
          Swal.fire({
            title: "Error",
            text: "Please select a company to predict its stock price.",
            icon: "error",
          });
          return;
        }
        predictStockPrice(selectedCompany);
      });
    },
    preConfirm: () => {
      const selectedCompany = document.getElementById("company-select").value;
      if (!selectedCompany) {
        Swal.showValidationMessage("Please select a company");
      }
      return selectedCompany;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const selectedCompany = result.value;
      fetchStockInfo(selectedCompany);
    }
  });
});

const fetchStockInfo = async (companySymbol) => {
  const API_KEY = "Rea3Kjnwleof1FTWhRAsMEOoo2QS2Sy2"; 
  const API_URL = `https://financialmodelingprep.com/api/v3/quote/${companySymbol}?apikey=${API_KEY}`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data && data.length > 0) {
      const stockData = data[0];  

      Swal.fire({
        title: `${companySymbol} Stock Information`,
        html: `
          <p><strong>Date:</strong> ${new Date(stockData.timestamp * 1000).toLocaleDateString()}</p>
          <p><strong>Open:</strong> $${stockData.open.toFixed(2)}</p>
          <p><strong>Close:</strong> $${stockData.price.toFixed(2)}</p>
          <p><strong>High:</strong> $${stockData.dayHigh.toFixed(2)}</p>
          <p><strong>Low:</strong> $${stockData.dayLow.toFixed(2)}</p>
          <p><strong>Volume:</strong> ${stockData.volume.toLocaleString()}</p>
        `,
        icon: "info",
      });
    } else {
      Swal.fire({
        title: "No Data Found",
        text: "Unable to fetch stock information for the selected company.",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error fetching stock data:", error);
    Swal.fire({
      title: "Error",
      text: "An error occurred while fetching stock data. Please try again later.",
      icon: "error",
    });
  }
};

const predictStockPrice = async (companySymbol) => {
  const API_KEY = "Rea3Kjnwleof1FTWhRAsMEOoo2QS2Sy2";  
  const API_URL = `https://financialmodelingprep.com/api/v3/quote/${companySymbol}?apikey=${API_KEY}`;

  try {
    const randomPercentageChange = (Math.random() - 0.5) * 0.1;  
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data && data.length > 0) {
      const stockData = data[0];  
      const predictedPrice = stockData.price * (1 + randomPercentageChange);  

      Swal.fire({
        title: `Predicted Price for ${companySymbol}`,
        html: `
          <p><strong>Current Close Price:</strong> $${stockData.price.toFixed(2)}</p>
          <p><strong>Predicted Close Price:</strong> $${predictedPrice.toFixed(2)}</p>
          <p><em>(Prediction is for informational purposes only)</em></p>
        `,
        icon: "info",
      });
    } else {
      Swal.fire({
        title: "Prediction Failed",
        text: "Unable to fetch stock data to make a prediction.",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error predicting stock price:", error);
    Swal.fire({
      title: "Error",
      text: "An error occurred while predicting stock price. Please try again later.",
      icon: "error",
    });
  }
};


document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");
  
   
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 2000);  
});


 
