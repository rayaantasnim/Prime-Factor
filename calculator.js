
    // Enhanced Cosmic 3D Particle Background Matrix Animation
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2500;
    const posArray = new Float32Array(particlesCount * 3);
    const scalesArray = new Float32Array(particlesCount);

    for(let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 25;
        posArray[i+1] = (Math.random() - 0.5) * 25;
        posArray[i+2] = (Math.random() - 0.5) * 25;
        scalesArray[i/3] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.035,
        color: '#38bdf8',
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add depth light field
    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 50);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    camera.position.z = 6;

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        particlesMesh.rotation.y = elapsedTime * 0.04 + targetX * 0.8;
        particlesMesh.rotation.x = elapsedTime * 0.03 + targetY * 0.8;
        
        pointLight.position.x = targetX * 10;
        pointLight.position.y = -targetY * 10;

        camera.position.x += (targetX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-targetY * 0.5 - camera.position.y) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Dynamic Speech Synthesis (Voice Output) Engine
    function speakMessage(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop active speaking queue
            const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/10⁴⁰/g, "10 to the power 40");
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Upgraded Voice Recognition & Precision Command Processing Engine
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceBtnText = document.getElementById('voiceBtnText');
    const micIcon = document.getElementById('micIcon');
    const inputField = document.getElementById('numberInput');
    let recognition = null;
    let secondaryRecognition = null;
    let isListening = false;
    let shouldBeListening = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const wordToDigitMap = {
        'zero': '0', 'one': '1', 'two': '2', 'to': '2', 'too': '2', 'three': '3', 
        'four': '4', 'for': '4', 'five': '5', 'six': '6', 'seven': '7', 
        'eight': '8', 'ate': '8', 'nine': '9', 'minus': '-', 'negative': '-'
    };

    function resetSystem() {
        inputField.value = '';
        previousInput = '';
        clearBtn.classList.add('hidden');
        clearInputAlerts();
        actionBtnContainer.style.opacity = '0';
        actionBtnContainer.style.transform = 'translateY(8px)';
        actionBtnContainer.style.pointerEvents = 'none';
        noticeBox.classList.add('hidden');
        resultBox.classList.add('hidden');
    }

    function createVoiceEngine(modelLang) {
        if (!SpeechRecognition) return null;
        const engine = new SpeechRecognition();
        engine.continuous = true;
        engine.interimResults = true;
        engine.maxAlternatives = 3;
        engine.lang = modelLang;
        return engine;
    }

    if (SpeechRecognition) {
        // Using precise model instances for multi-fidelity input & high-speed audio stream evaluation
        recognition = createVoiceEngine('en-US');
        secondaryRecognition = createVoiceEngine('en-GB');

        function handleSpeechResults(event) {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                let transcriptText = event.results[i][0].transcript.trim().toLowerCase();
                if (!transcriptText) continue;

                // Precision Command Recognition System
                const isVanishCommand = /\b(vanish|clear|reset|wipe|purge)\b/i.test(transcriptText);
                const isDeleteCommand = /\b(delete|erase|remove)\b/i.test(transcriptText);

                if (isVanishCommand) {
                    resetSystem();
                    continue;
                }

                if (isDeleteCommand) {
                    if (inputField.value.length > 0) {
                        inputField.value = inputField.value.slice(0, -1);
                        evaluateNumber();
                    }
                    continue;
                }

                // Process spoken digits and strictly exclude letter/string payloads
                let words = transcriptText.split(/\s+/);
                let validSpeech = true;
                let appendedDigits = '';

                for (let word of words) {
                    if (!word) continue;
                    if (wordToDigitMap[word] !== undefined) {
                        appendedDigits += wordToDigitMap[word];
                    } else if (/^\d+$/.test(word)) {
                        appendedDigits += word;
                    } else if (word === '-' || word === 'minus') {
                        if (inputField.value.length === 0 && appendedDigits.length === 0) {
                            appendedDigits += '-';
                        }
                    } else {
                        validSpeech = false;
                        break;
                    }
                }

                if (validSpeech && appendedDigits.length > 0) {
                    inputField.value += appendedDigits;
                    evaluateNumber();
                } else if (!validSpeech) {
                    showNotice("Numeral Values is allowed only", "error");
                }
            }
        }

        recognition.onstart = function() {
            isListening = true;
            voiceBtnText.textContent = "Listening...";
            voiceBtn.classList.remove('bg-cyan-500/10', 'text-cyan-400');
            voiceBtn.classList.add('bg-rose-500/20', 'text-rose-400', 'animate-pulse');
        };

        recognition.onresult = handleSpeechResults;
        if (secondaryRecognition) {
            secondaryRecognition.onresult = handleSpeechResults;
        }

        recognition.onerror = function(event) {
            // High-availability silence recovery
        };

        recognition.onend = function() {
            isListening = false;
            if (shouldBeListening) {
                try {
                    recognition.start();
                    if (secondaryRecognition) secondaryRecognition.start();
                } catch(e) {}
            } else {
                stopListening();
            }
        };
    } else {
        voiceBtn.style.display = 'none';
    }

    // Strict Voice Lockout for Manual String/Letter Typing
    inputField.addEventListener('keydown', (e) => {
        if (isListening || shouldBeListening) {
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
            const isNumberKey = /^[0-9]$/.test(e.key);
            if (!isNumberKey && !allowedKeys.includes(e.key)) {
                e.preventDefault();
                showNotice("Numeral Values is allowed only", "error");
            }
        }
    });

    function stopListening() {
        shouldBeListening = false;
        isListening = false;
        voiceBtnText.textContent = "Start Voice Input";
        voiceBtn.classList.remove('bg-rose-500/20', 'text-rose-400', 'animate-pulse');
        voiceBtn.classList.add('bg-cyan-500/10', 'text-cyan-400');
        if (recognition) recognition.stop();
        if (secondaryRecognition) secondaryRecognition.stop();
    }

    voiceBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (isListening || shouldBeListening) {
            stopListening();
        } else {
            try {
                shouldBeListening = true;
                recognition.start();
                if (secondaryRecognition) secondaryRecognition.start();
            } catch(e) {
                stopListening();
            }
        }
    });

    // Application Logic & Upgraded Redefined Error/Notification System
    const clearBtn = document.getElementById('clearBtn');
    const actionBtnContainer = document.getElementById('actionButtonContainer');
    const processBtn = document.getElementById('processBtn');
    const noticeBox = document.getElementById('noticeBox');
    const resultBox = document.getElementById('resultBox');

    let previousInput = '';
    const MAX_LIMIT_BIGINT = 10n ** 40n;
    const MIN_MAX_LIMIT_BIGINT = 10n ** 39n;

    function clearInputAlerts() {
        inputField.classList.remove('red-siren-glow', 'red-static-glow', 'border-rose-500', 'border-amber-500');
        inputField.disabled = false;
    }

    function evaluateNumber() {
        const rawVal = inputField.value.trim();
        
        if (rawVal.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }

        if (!rawVal) {
            previousInput = '';
            actionBtnContainer.style.opacity = '0';
            actionBtnContainer.style.transform = 'translateY(8px)';
            actionBtnContainer.style.pointerEvents = 'none';
            noticeBox.classList.add('hidden');
            resultBox.classList.add('hidden');
            clearInputAlerts();
            return;
        }

        let cleanedStr = rawVal.replace(/[\s,]+/g, '');

        if (/^0+$/.test(cleanedStr)) {
            clearInputAlerts();
            inputField.classList.add('red-siren-glow');
            actionBtnContainer.style.opacity = '0';
            actionBtnContainer.style.transform = 'translateY(8px)';
            actionBtnContainer.style.pointerEvents = 'none';
            resultBox.classList.add('hidden');
            showNotice("Zero Error: Pure zero input is not permitted. Please provide a valid numeral value alongside digits (e.g., 00001).", "error");
            return;
        }

        const match = cleanedStr.match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
        
        let isExceeding = false;
        let isOverFortyDigits = false;
        let isExactMaxLimit = false; // 10^40
        let isLastRange39 = false; // 10^39

        if (match) {
            let extractedNumStr = match[0];
            let isNeg = extractedNumStr.startsWith('-');
            let absCheckStr = isNeg ? extractedNumStr.slice(1) : extractedNumStr;
            
            try {
                if (absCheckStr.toLowerCase().includes('e')) {
                    let parts = absCheckStr.toLowerCase().split('e');
                    let baseVal = parseFloat(parts[0]);
                    let expVal = parseInt(parts[1], 10);
                    if (expVal > 40 || (expVal === 40 && baseVal > 1)) {
                        isExceeding = true;
                        isOverFortyDigits = true;
                    } else if (expVal === 40 && baseVal === 1) {
                        isExactMaxLimit = true;
                    } else if (expVal === 39) {
                        isLastRange39 = true;
                    }
                } else {
                    let integerPart = absCheckStr.split('.')[0] || "0";
                    if (integerPart.length > 41) {
                        isOverFortyDigits = true;
                        isExceeding = true;
                    } else {
                        let numBig = BigInt(integerPart);
                        if (numBig > MAX_LIMIT_BIGINT) {
                            isExceeding = true;
                        } else if (numBig === MAX_LIMIT_BIGINT) {
                            isExactMaxLimit = true;
                        } else if (numBig >= MIN_MAX_LIMIT_BIGINT && numBig < MAX_LIMIT_BIGINT) {
                            isLastRange39 = true;
                        }
                    }
                }
            } catch (e) {
                // Ignore parse issues during live typing
            }
        }

        // Limit Exceed Error (> 10^40)
        if (isOverFortyDigits || isExceeding) {
            inputField.value = previousInput;
            clearInputAlerts();
            inputField.classList.add('red-siren-glow');
            actionBtnContainer.style.opacity = '0';
            actionBtnContainer.style.transform = 'translateY(8px)';
            actionBtnContainer.style.pointerEvents = 'none';
            resultBox.classList.add('hidden');
            showNotice("Limit Exceed Error: The inputted number has crossed the 10⁴⁰ operational limit. Please decrease the numeral value of input to resume processing.", "error");
            return;
        }

        previousInput = rawVal;
        clearInputAlerts();

        // Limit Reached Error: Exactly 10 to the power 40
        if (isExactMaxLimit) {
            inputField.classList.add('red-static-glow');
            inputField.disabled = true;
            showNotice("Limit Reached Error: The maximum operational boundary of 10⁴⁰ has been achieved. The input field is now locked. You can decrease the inputted number to resume operation.", "warning");
            actionBtnContainer.style.opacity = '1';
            actionBtnContainer.style.transform = 'translateY(0)';
            actionBtnContainer.style.pointerEvents = 'auto';
            processFactorization(rawVal);
            return;
        }

        // 10 to the power 39 range message with light-red neon white siren alert and unlocked input
        if (isLastRange39) {
            inputField.classList.add('red-siren-glow');
            showNotice("It is the last range and no more input is allowed. Decrease the input to resume the processor again.", "warning");
            actionBtnContainer.style.opacity = '1';
            actionBtnContainer.style.transform = 'translateY(0)';
            actionBtnContainer.style.pointerEvents = 'auto';
            processFactorization(rawVal);
            return;
        }

        noticeBox.classList.add('hidden');
        actionBtnContainer.style.opacity = '1';
        actionBtnContainer.style.transform = 'translateY(0)';
        actionBtnContainer.style.pointerEvents = 'auto';

        processFactorization(rawVal);
    }

    inputField.addEventListener('input', evaluateNumber);
    processBtn.addEventListener('click', () => processFactorization(inputField.value.trim()));

    clearBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the input field?")) {
            resetSystem();
        }
    });

    function modularExponentiation(base, exp, mod) {
        let res = 1n;
        base = base % mod;
        while (exp > 0n) {
            if (exp % 2n === 1n) res = (res * base) % mod;
            base = (base * base) % mod;
            exp /= 2n;
        }
        return res;
    }

    function isPrimeBigInt(n) {
        if (n <= 1n) return false;
        if (n <= 3n) return true;
        if (n % 2n === 0n || n % 3n === 0n) return false;
        
        let d = n - 1n;
        let s = 0n;
        while (d % 2n === 0n) {
            d /= 2n;
            s += 1n;
        }

        const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
        for (let a of witnesses) {
            if (n <= a) break;
            let x = modularExponentiation(a, d, n);
            if (x === 1n || x === n - 1n) continue;
            let composite = true;
            for (let r = 1n; r < s; r++) {
                x = (x * x) % n;
                if (x === n - 1n) {
                    composite = false;
                    break;
                }
            }
            if (composite) return false;
        }
        return true;
    }

    function gcd(a, b) {
        while (b !== 0n) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a < 0n ? -a : a;
    }

    function pollardRhoBrent(n) {
        if (n % 2n === 0n) return 2n;
        if (n % 3n === 0n) return 3n;
        if (isPrimeBigInt(n)) return n;

        let y = 2n, r = 1n, q = 1n, g = 1n, ys = 2n, x = 2n;
        let m = 100n;
        let c = 1n;

        while (g === 1n) {
            x = y;
            for (let i = 0n; i < r; i++) {
                y = (modularExponentiation(y, 2n, n) + c) % n;
            }
            let k = 0n;
            while (k < r && g === 1n) {
                ys = y;
                let limit = (m < r - k) ? m : (r - k);
                for (let i = 0n; i < limit; i++) {
                    y = (modularExponentiation(y, 2n, n) + c) % n;
                    let diff = x > y ? x - y : y - x;
                    q = (q * diff) % n;
                }
                g = gcd(q, n);
                k += m;
            }
            r *= 2n;
            if (g === n) {
                g = 1n;
                y = ys;
                c += 1n;
                r = 1n;
                q = 1n;
            }
        }
        return g;
    }

    function factorizeRecursive(n, factorsList, depth = 0) {
        if (n <= 1n || depth > 150) return;
        if (isPrimeBigInt(n)) {
            factorsList.push(n);
            return;
        }
        let divisor = pollardRhoBrent(n);
        if (divisor === n) {
            factorsList.push(n);
            return;
        }
        factorizeRecursive(divisor, factorsList, depth + 1);
        factorizeRecursive(n / divisor, factorsList, depth + 1);
    }

    function processFactorization(rawInputStr) {
        let cleanedStr = rawInputStr.replace(/[\s,]+/g, '');
        
        if (!/\d/.test(cleanedStr)) {
            showNotice("Please provide a valid numeric entry scale.", "error");
            return;
        }

        if (/^0+$/.test(cleanedStr)) {
            showNotice("Zero Error: Pure zero input is not permitted.", "error");
            return;
        }

        const match = cleanedStr.match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
        if (!match) {
            showNotice("Please provide a valid numeric entry scale.", "error");
            return;
        }

        let extractedNumStr = match[0];
        let absCheckStr = extractedNumStr.startsWith('-') ? extractedNumStr.slice(1) : extractedNumStr;

        try {
            if (absCheckStr.toLowerCase().includes('e')) {
                let parts = absCheckStr.toLowerCase().split('e');
                let baseVal = parseFloat(parts[0]);
                let expVal = parseInt(parts[1], 10);
                if (expVal > 40 || (expVal === 40 && baseVal > 1)) {
                    showNotice("Limit Exceed Error: Input crossed operational threshold.", "error");
                    return;
                }
            } else {
                let integerPart = absCheckStr.split('.')[0] || "0";
                if (integerPart.length > 41 || BigInt(integerPart) > MAX_LIMIT_BIGINT) {
                    showNotice("Limit Exceed Error: Input crossed operational threshold.", "error");
                    return;
                }
            }
        } catch (e) {
            showNotice("Please provide a valid numeric entry scale.", "error");
            return;
        }

        let bigNum;
        let displayValStr = extractedNumStr;

        if (extractedNumStr.includes('.')) {
            let parts = extractedNumStr.split('.');
            displayValStr = extractedNumStr;
            extractedNumStr = parts[0];
            if (extractedNumStr === "" || extractedNumStr === "-") {
                extractedNumStr = "0";
            }
        }

        let absStr = extractedNumStr.startsWith('-') ? extractedNumStr.slice(1) : extractedNumStr;
        let magnitudeStr = "0";
        if (absStr.includes('e') || absStr.includes('E')) {
            magnitudeStr = absStr;
        } else {
            let trimmedInt = absStr.replace(/^0+/, '');
            if (trimmedInt === "") {
                magnitudeStr = "0";
            } else {
                let expPower = trimmedInt.length - 1;
                magnitudeStr = `10<sup>${expPower}</sup>`;
            }
        }

        try {
            bigNum = BigInt(extractedNumStr);
        } catch (e) {
            showNotice("Please provide a valid numeric entry scale.", "error");
            return;
        }

        if (bigNum === 0n) {
            showNotice("Zero Error: Zero is not allowed to provide alone.", "error");
            return;
        }

        let workNum = bigNum;
        let isNegative = false;
        if (workNum < 0n) {
            isNegative = true;
            workNum = -workNum;
        }

        if (workNum === 1n) {
            let classification = isNegative ? "Negative Unit (-1)" : "Unity (1)";
            displayResults(displayValStr, magnitudeStr, classification, isNegative ? ["-1"] : ["1"], isNegative ? "-1" : "1", isNegative ? "-1" : "1");
            return;
        }

        let primeStatus = isPrimeBigInt(workNum);
        let factors = [];

        if (!primeStatus) {
            let smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n];
            for (let p of smallPrimes) {
                while (workNum % p === 0n) {
                    factors.push(p);
                    workNum /= p;
                }
            }
            if (workNum > 1n) {
                if (isPrimeBigInt(workNum)) {
                    factors.push(workNum);
                } else {
                    factorizeRecursive(workNum, factors);
                }
            }
            factors.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        } else {
            factors.push(workNum);
        }

        let countMap = {};
        for (let f of factors) {
            countMap[f.toString()] = (countMap[f.toString()] || 0) + 1;
        }

        if (isNegative) {
            factors.unshift(-1n);
            countMap['-1'] = 1;
        }

        let uniqueFactorsStr = Object.keys(countMap).join(', ');
        let productStr = (isNegative ? "-1 × " : "") + factors.filter(f => f !== -1n).join(' × ');
        if (isNegative && factors.length === 1) productStr = "-1";

        let expParts = [];
        for (const [p, cnt] of Object.entries(countMap)) {
            if (cnt > 1) {
                expParts.push(`${p}<sup>${cnt}</sup>`);
            } else {
                expParts.push(p);
            }
        }
        let expStr = expParts.join(' × ');

        let classificationText = primeStatus ? "Prime Number Matrix Detected" : "Composite Number Matrix";
        
        if (primeStatus) {
            productStr = "1 × " + productStr;
            expStr = "1 × " + expStr;
            showNotice("Prime Number Notification: Prime number detected successfully.", "success");
        }

        displayResults(displayValStr, magnitudeStr, classificationText, uniqueFactorsStr, productStr, expStr);
    }

    function displayResults(inputtedVal, magnitude, classification, uniqueFactors, product, exponential) {
        document.getElementById('inputtedValDisplay').textContent = inputtedVal;
        document.getElementById('inputMagnitudeDisplay').innerHTML = magnitude;
        document.getElementById('classificationVal').textContent = classification;
        document.getElementById('factorsList').textContent = uniqueFactors;
        document.getElementById('productForm').textContent = product;
        document.getElementById('exponentialForm').innerHTML = exponential;
        resultBox.classList.remove('hidden');
    }

    function showNotice(message, type) {
        noticeBox.className = "mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all block ";
        if (type === 'error') {
            noticeBox.classList.add('bg-rose-500/10', 'border-rose-500/30', 'text-rose-300');
        } else if (type === 'success') {
            noticeBox.classList.add('bg-emerald-500/10', 'border-emerald-500/30', 'text-emerald-300');
        } else if (type === 'warning') {
            noticeBox.classList.add('bg-amber-500/10', 'border-amber-500/30', 'text-amber-300');
        } else {
            noticeBox.classList.add('bg-cyan-500/10', 'border-cyan-500/30', 'text-cyan-300');
        }
        noticeBox.textContent = message;
        noticeBox.classList.remove('hidden');
        
        // Automatic dynamic speech synthesizer playback
        speakMessage(message);
    }
