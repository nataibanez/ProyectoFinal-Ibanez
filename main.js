    // Función de cálculo de edad
    
    let calculoEdad = () => {
        let now = new Date();
        let currentY = now.getFullYear();
        let dobget = document.getElementById("fechanacimiento").value;
        let dob = new Date(dobget);
        let prevY = dob.getFullYear();
        ageY = currentY - prevY;

        document.getElementById('edadEnAnos').innerHTML = ageY + ' años ';
    }

    // Función para convertir fecha a texto legible natural
    // Nota: era la forma más sencilla sin usar módulos nodejs como chrono

    function formatDate(date) {
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Variables iniciales

    let basePrice = 0;
    let serviceType = "";
    let serviceTypeFactor = 0;
    let ageFactor = 0;
    let totalPrice = 0;
    let healthServicesArray = [];
    let deleteChoice;
    let healthServiceObject;
    let filteredServicesArray = [];
    let healthServicesAvailability = [
        { name: "medicina general", availableDoctors: 10, availableDate: "2024-08-5" },
        { name: "medicina familiar", availableDoctors: 5, availableDate: "2024-08-5" },
        { name: "medicina interna", availableDoctors: 4, availableDate: "2024-08-7" },
        { name: "cirugia", availableDoctors: 4, availableDate: "2024-08-9" },
        { name: "ginecologia", availableDoctors: 4, availableDate: "2024-08-12" },
        { name: "psiquiatria", availableDoctors: 5, availableDate: "2024-08-15" },
        { name: "dermatologia", availableDoctors: 2, availableDate: "2024-08-16" },
    ];
    let doctorsDirectory = [];
    let availableDoctors = "";
    let availableDate;
    let selectedDoctorId;
    let selectedDoctor;
    let searchName;
    let ageY;
    let doctorCardContainer;
    
    //  Fix para problemas de DOM

document.addEventListener("DOMContentLoaded", function() {

    // Inicial: obtener datos de localStorage
    let healthServices = JSON.parse(localStorage.getItem("healthServices")) || [];

    // Condición que revisa si healthServices tiene un valor truthy
    if (!healthServices || healthServices.length === 0) {
        healthServicesId = 1;
    } 
    else {
        healthServicesId = healthServices[healthServices.length - 1].id + 1;
    }

    // Fetching de datos de médicos desde el JSON

    fetch('./doctors.json', { method: "GET" })
    .then((res) => res.json())
    .then((data) => {
        if (Array.isArray(data.doctors)) {
            doctorsDirectory = data.doctors;
            
    // Cargar desde localStorage la especialidad seleccionada al cargar la página
            const savedSpecialty = localStorage.getItem("selectedSpecialty");

    // Renderizar las tarjetas de doctores basadas en la especialidad seleccionada o un valor predeterminado
            if (savedSpecialty) {
                renderDoctorCards(savedSpecialty);
                document.getElementById("serviceInput").value = savedSpecialty;
            } 
            else {
                renderDoctorCards('Medicina general');
            }
            } 
            else {
            console.log("Error en el fetching de datos");
        }
    })
    .catch((error) => console.log(error));

        
    // Cálculo de factor de precio de ISAPRE

    let isapreCalc = (isapreCompany) => {
        switch (isapreCompany) {
            case "banmedica":
            case "consalud":
                basePrice = 12000;
                break;
            case "colmena":
            case "cruzblanca":
            case "masvida":
                basePrice = 15000;
                break;
            case "vidatres":
            case "esencial":
                basePrice = 20000;
                break;
            default:
                alert("Dato de ISAPRE incorrecto, ingrese nuevamente");
        }
    }

    // Cálculo de factor de precio por especialidad
    // Además, agrega disponibilidad de médicos y próxima fecha disponible
    // Por mantener la estructura y las premisas de la entrega mantengo estas variables, pero podrían fácilmente eliminarse y usar sólo los datos del JSON

    let serviceCalc = (serviceType) => {
        switch (serviceType) {
            case "Medicina general":
                serviceTypeFactor = 1;
                availableDoctors = 10;
                availableDate = "2024-08-5";
                break;
            case "Medicina familiar":
                serviceTypeFactor = 1.3;
                availableDoctors = 5;
                availableDate = "2024-08-5";
                break;
            case "Medicina interna":
                serviceTypeFactor = 1.5;
                availableDoctors = 4;
                availableDate = "2024-08-7";
                break;
            case "Cirugía":
                serviceTypeFactor = 1.5;
                availableDoctors = 4;
                availableDate = "2024-08-9";
                break;
            case "Ginecología":
                serviceTypeFactor = 1.5;
                break;
            case "Psiquiatría":
                serviceTypeFactor = 1.8;
                availableDoctors = 5;
                availableDate = "2024-08-15";
                break;
            case "Dermatología":
                serviceTypeFactor = 1.8;
                availableDoctors = 2;
                availableDate = "2024-08-16";
                break;
            default:
                alert("Dato de especialidad incorrecto, ingrese nuevamente");
        }
    }

    // Cálculo de factor de precio por edad

    let ageCalc = (patientAge) => {
        if (patientAge >= 65) {
            ageFactor = 1.65;
        }
        else if (patientAge >= 45) {
            ageFactor = 1.5;
        }
        else if (patientAge >= 35) {
            ageFactor = 1.35;
        }
        else if (patientAge >= 18) {
            ageFactor = 1.25;
        }
        else if (patientAge <= 19) {
            ageFactor = 1;
        }
        else {
            alert("Dato de edad inválido, ingrese nuevamente");
            return
        }
    }

    // Cálculo de precio final basado en los tres factores

    function calculateTotalPrice(basePrice, serviceTypeFactor, ageFactor) {
        totalPrice = basePrice * serviceTypeFactor * ageFactor;
        return totalPrice;
    }

// Tareas del botón submit, junta muchas funciones
let submitButtonProc = () => {
    // Manejo de inputs
    let nombrePcte = document.getElementById("nameInput").value;
    let fonoPcte = document.getElementById("phoneInput").value;
    let emailPcte = document.getElementById("emailInput").value;
    let isapreCompany = document.getElementById("isapreInput").value;
    let serviceType = document.getElementById("serviceInput").value;
    let edadPcte = ageY;

    // Chequeo adicional de que la edad esté agregada, por alguna razón en ageCalc no pilla todos los errores
    // Creo que es porque se evalúa un número, y con valores null o undefined, no anda
    if (!edadPcte) {
        alert("Dato de edad inválido, ingrese nuevamente");
        return;
    }

    // Cálculo de precio total
    isapreCalc(isapreCompany);
    serviceCalc(serviceType);
    ageCalc(edadPcte);
    calculateTotalPrice(basePrice, serviceTypeFactor, ageFactor);
    console.log(`Precio total: CLP$${totalPrice}`);

    // Chequeo de que el doctor esté seleccionado
    if (selectedDoctorId !== null) {
        // Find para que reconozca correctamente el médico seleccionado
        let selectedDoctor = doctorsDirectory.find(doctor => doctor.id === selectedDoctorId);
        
        // Creación del objeto y actualización del id, saca datos del array estático y datos del JSON de médicos (selectedDoctor)
        healthServiceObject = {
            id: healthServicesId,
            name: nombrePcte,
            phone: fonoPcte,
            email: emailPcte,
            isapre: isapreCompany,
            service: serviceType,
            factor: (serviceTypeFactor * ageFactor),
            price: totalPrice,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            nextdate: selectedDoctor.next_date,
            doctorImg: selectedDoctor.img,
        };

        healthServices.push(healthServiceObject);
        console.log(healthServices);
        healthServicesId++;

        // Alerta con sweetalert, cuando se agrega atención exitosamente
        Swal.fire({
            title: "Atención agregada con éxito",
            icon: "success",
            position: "center",
            confirmButtonText: "aceptar",
            timer: 3000,
        });

        // Agrego la atención al localstorage healthServices, y renderizo de nuevo
        localStorage.setItem("healthServices", JSON.stringify(healthServices));
        cardRenderer();
        // Por si el médico no fue seleccionado..
    } 
    else {
        alert("Por favor, seleccione un médico antes de enviar.");
    }
};

    // Event listen para mostrar tarjetas cuando se elige la especialidad
    document.getElementById("serviceInput").addEventListener("change", (event) => {
        const selectedService = event.target.value;
    
    // Guardar en localStorage la especialidad seleccionada
        localStorage.setItem("selectedSpecialty", selectedService);
    
    // Renderizar las tarjetas de doctores basadas en la especialidad seleccionada
        renderDoctorCards(selectedService);
    });

    // Botón enviar 

    let submitButton = document.getElementById("submit-btn");
        submitButton.addEventListener("click", submitButtonProc);

    // Creación de las tarjetas

    function createCard(service) {
        let card = document.createElement('div');
        card.className = 'card';

    // Borrado de tarjeta v2, versión sweetalert

    let deleteCard = (id) => {
        Swal.fire({
            title: "¿Desea eliminar la atención?",
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            confirmButtonColor: "#d33",
            denyButtonText: `Cancelar`,
            denyButtonColor: "#3085d6",
        }).then((res) => {
            if (res.isConfirmed) {
                // Código para eliminar la tarjeta
                healthServices = healthServices.filter(service => service.id !== id);
                localStorage.setItem("healthServices", JSON.stringify(healthServices));
                cardRenderer();
                Swal.fire({
                    title: "Su hora ha sido eliminada exitosamente",
                    icon: "info",
                });
            } 
            else if (res.isDenied) {
                Swal.fire({
                    title: "No se eliminó su atención",
                    icon: "info",
                });
            }
        });
    };



// Relleno de datos a cada tarjeta de la atención

// Creación de container
    let contentContainer = document.createElement('div');
    contentContainer.className = 'card-content';

// Creación-asignación de foto a cada médico
    let img = document.createElement('img');
    img.src = service.doctorImg;
    img.alt = `Foto de ${service.doctorName}`;
    img.className = 'doctor-big-card-photo';

// Creación de container para poner los textos de la tarjeta, luego se rellena con los datos correspondientes
    let textContainer = document.createElement('div');
    textContainer.className = 'card-text';

    let title = document.createElement('h2');
        title.textContent = `${service.service}, ${service.doctorName}`;
        textContainer.appendChild(title);

    let name = document.createElement('h2');
        name.textContent = service.name;
        textContainer.appendChild(name);

    let nextdate = document.createElement('p');
        nextdate.textContent = `Fecha de atención: ${formatDate(new Date(service.nextdate))}`;
        textContainer.appendChild(nextdate);

    let price = document.createElement('p');
        price.textContent = `Precio de atención: $${service.price}`;
        textContainer.appendChild(price);

    let phonehelp = document.createElement('p');
    phonehelp.textContent = `Se confirmará su hora por vía telefónica en menos de 60 minutos, al número ${service.phone}`;
    textContainer.appendChild(phonehelp);

    // Se rellena la imagen del médico a la tarjeta correspondiente

    contentContainer.appendChild(img);
    contentContainer.appendChild(textContainer);
    card.appendChild(contentContainer);


    // Implementación del botón de eliminar para cada tarjeta, invoca la función deleteCard
    
    let deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.id = `delete-btn-${service.id}`;
        deleteButton.textContent = "Eliminar"
        deleteButton.addEventListener('click', () => deleteCard(service.id));

        card.appendChild(deleteButton);
       
        return card;
}

    // Tarjetas de médicos: creación del container

    let cardContainer = document.getElementById('card-container');

    // Función de renderizado "repintado" de tarjetas
    let cardRenderer = () => {
        cardContainer.innerHTML = '';
        healthServices.forEach(service => {
        const card = createCard(service);
        cardContainer.appendChild(card);
    });
}

    // Sección DOM de tarjetas de médicos

    function renderDoctorCards(serviceType) {
        const filteredDoctors = doctorsDirectory.filter(doctor => doctor.specialty === serviceType);
    
        const doctorCardContainer = document.getElementById('doctorCardContainer');
        doctorCardContainer.innerHTML = '';
    
        if (filteredDoctors.length == 0) {
            doctorCardContainer.innerHTML = '<p>Elija la especialidad.</p>';
        } 
        else {
            filteredDoctors.forEach(doctor => {
                const doctorCard = createDoctorCard(doctor);
                doctorCardContainer.appendChild(doctorCard);
    
        // Recupera el doctor seleccionado desde localStorage
                const savedDoctorId = localStorage.getItem("selectedDoctorId");
                if (savedDoctorId && parseInt(savedDoctorId) === doctor.id) {
                    doctorCard.classList.add('selected');
                }
        });
        }
    }

   // Función que crea tarjetas de doctores disponibles al elegir la especialidad

   function createDoctorCard(doctor) {
    let card = document.createElement('div');
        card.className = 'doctor-card clickable'; 
        card.id = `doctor-card-${doctor.id}`;

        card.addEventListener('click', () => {
            handleDoctorCardClick(doctor);
    });

    // Create a container for the image and text
    let contentContainer = document.createElement('div');
        contentContainer.className = 'doctor-card-content';

    // Zona de procesado de imágenes de perfil de los médicos
    let img = document.createElement('img');
        img.src = doctor.img;
        img.alt = `Foto de ${doctor.name}`;
        img.className = 'doctor-photo';

    // Zona de muestra de datos (texto) de las tarjetas de médicos
    let textContainer = document.createElement('div');
    textContainer.className = 'doctor-card-text';

    let name = document.createElement('h2');
        name.textContent = `${doctor.name}`;
        textContainer.appendChild(name);

    let almamater = document.createElement('p');
        almamater.textContent = `${doctor.alma_mater}`;
        textContainer.appendChild(almamater);

    let nextDate = document.createElement('p');
        nextDate.textContent = `Disponible: ${formatDate(new Date(doctor.next_date))}`;
        textContainer.appendChild(nextDate);

    let rating = document.createElement('p');
        rating.textContent = `Calificación: ${doctor.rating}⭐`;
        textContainer.appendChild(rating);

    contentContainer.appendChild(img);
    contentContainer.appendChild(textContainer);

    card.appendChild(contentContainer);
    return card;
}

    // Función para seleccionar doctor, al clickear se selecciona y aplica CSS de selected
    function handleDoctorCardClick(doctor) {
        selectedDoctorId = doctor.id;
    
        // guarda el ID de doctor seleccionado en localStorage
        localStorage.setItem("selectedDoctorId", selectedDoctorId);
    
        // Deja el médico como "seleccionado" y elimina la marca de selección de los otros médicos
        document.querySelectorAll('.doctor-card').forEach(card => {
            card.classList.remove('selected');
        });
    
        let selectedCard = document.getElementById(`doctor-card-${doctor.id}`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            } 
            else {
                console.log(`Error de selección de médico`);
            }
    }
    // Cargar desde localStorage la especialidad seleccionada al cargar la página
    const savedSpecialty = localStorage.getItem("selectedSpecialty");
    
    // Renderizado inicial de tarjetas de atención (no médicos) agregadas
    cardRenderer();

    // Renderizar las tarjetas de doctores basadas en la especialidad seleccionada (esto en caso de refrescar la página)
    // Si falla, muestra las cards de Medicina general
    if (savedSpecialty) {
        renderDoctorCards(savedSpecialty);
        document.getElementById("serviceInput").value = savedSpecialty;
    } 
    else {
        renderDoctorCards('Medicina general');
    }
})