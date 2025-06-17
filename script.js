class CNPJSystem {
    constructor() {
        this.data = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const generateBtn = document.getElementById('generateBtn');
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        const exportExcelBtn = document.getElementById('exportExcelBtn');

        generateBtn.addEventListener('click', () => this.generateData());
        exportCsvBtn.addEventListener('click', () => this.exportCSV());
        exportExcelBtn.addEventListener('click', () => this.exportExcel());
    }

    // Função para validar CNPJ
    validateCNPJ(cnpj) {
        // Remove caracteres não numéricos
        cnpj = cnpj.replace(/[^\d]/g, '');
        
        // Verifica se tem 14 dígitos
        if (cnpj.length !== 14) return false;
        
        // Verifica se não são todos iguais
        if (/^(\d)\1+$/.test(cnpj)) return false;
        
        return true;
    }

    // Função para validar email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Função para gerar ID único (simulando os IDs da imagem)
    generateUniqueId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        return `${timestamp}${random}`.padEnd(15, '0').substring(0, 15);
    }

    // Função para gerar vendorId (baseado no padrão da imagem)
    generateVendorId() {
        const prefix = '7312b2db-b028-4bd9-9d8a-a8cfa006029e';
        return prefix;
    }

    // Função para limpar e processar CNPJs
    processCNPJs(cnpjText) {
        const cnpjs = cnpjText.split('\n')
            .map(cnpj => cnpj.trim())
            .filter(cnpj => cnpj.length > 0);
        
        const validCNPJs = [];
        const invalidCNPJs = [];

        cnpjs.forEach(cnpj => {
            if (this.validateCNPJ(cnpj)) {
                validCNPJs.push(cnpj.replace(/[^\d]/g, ''));
            } else {
                invalidCNPJs.push(cnpj);
            }
        });

        return { validCNPJs, invalidCNPJs };
    }

    // Função para processar emails
    processEmails(emailText) {
        const emails = emailText.split('\n')
            .map(email => email.trim())
            .filter(email => email.length > 0);
        
        const validEmails = [];
        const invalidEmails = [];

        emails.forEach(email => {
            if (this.validateEmail(email)) {
                validEmails.push(email);
            } else {
                invalidEmails.push(email);
            }
        });

        return { validEmails, invalidEmails };
    }

    // Função principal para gerar os dados
    generateData() {
        const cnpjText = document.getElementById('cnpjs').value;
        const emailText = document.getElementById('emails').value;
        const action = document.getElementById('action').value;
        const vendorName = document.getElementById('vendorName').value || 'AMBEV';
        const country = document.getElementById('country').value || 'BR';

        // Limpar mensagens anteriores
        this.clearMessages();

        // Validar entradas
        if (!cnpjText.trim()) {
            this.showError('Por favor, insira pelo menos um CNPJ.');
            return;
        }

        if (!emailText.trim()) {
            this.showError('Por favor, insira pelo menos um email.');
            return;
        }

        // Processar CNPJs e emails
        const { validCNPJs, invalidCNPJs } = this.processCNPJs(cnpjText);
        const { validEmails, invalidEmails } = this.processEmails(emailText);

        // Mostrar erros se houver
        if (invalidCNPJs.length > 0) {
            this.showError(`CNPJs inválidos encontrados: ${invalidCNPJs.join(', ')}`);
        }

        if (invalidEmails.length > 0) {
            this.showError(`Emails inválidos encontrados: ${invalidEmails.join(', ')}`);
        }

        if (validCNPJs.length === 0) {
            this.showError('Nenhum CNPJ válido encontrado.');
            return;
        }

        if (validEmails.length === 0) {
            this.showError('Nenhum email válido encontrado.');
            return;
        }

        // Gerar dados combinados
        this.data = [];
        const vendorId = this.generateVendorId();

        validCNPJs.forEach(cnpj => {
            validEmails.forEach(email => {
                this.data.push({
                    user: email,
                    country: country.toUpperCase(),
                    vendorAccountId: cnpj,
                    vendorId: vendorId,
                    vendorName: vendorName.toUpperCase(),
                    action: action
                });
            });
        });

        // Atualizar tabela
        this.updateTable();
        
        // Habilitar botões de exportação
        document.getElementById('exportCsvBtn').disabled = false;
        document.getElementById('exportExcelBtn').disabled = false;

        // Mostrar mensagem de sucesso
        this.showSuccess(`${this.data.length} registros gerados com sucesso!`);
    }

    // Função para atualizar a tabela
    updateTable() {
        const tbody = document.getElementById('resultTableBody');
        tbody.innerHTML = '';

        this.data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.user}</td>
                <td>${row.country}</td>
                <td>${row.vendorAccountId}</td>
                <td>${row.vendorId}</td>
                <td>${row.vendorName}</td>
                <td>${row.action}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Função para exportar CSV
    exportCSV() {
        if (this.data.length === 0) {
            this.showError('Nenhum dado para exportar.');
            return;
        }

        const headers = ['user', 'country', 'vendorAccountId', 'vendorId', 'vendorName', 'action'];
        const csvContent = [
            headers.join(','),
            ...this.data.map(row => 
                headers.map(header => `"${row[header]}"`).join(',')
            )
        ].join('\n');

        this.downloadFile(csvContent, 'cnpj-data.csv', 'text/csv');
    }

    // Função para exportar Excel (formato CSV compatível)
    exportExcel() {
        if (this.data.length === 0) {
            this.showError('Nenhum dado para exportar.');
            return;
        }

        const headers = ['user', 'country', 'vendorAccountId', 'vendorId', 'vendorName', 'action'];
        const csvContent = [
            headers.join('\t'),
            ...this.data.map(row => 
                headers.map(header => row[header]).join('\t')
            )
        ].join('\n');

        this.downloadFile(csvContent, 'cnpj-data.xlsx', 'application/vnd.ms-excel');
    }

    // Função para fazer download do arquivo
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess(`Arquivo ${filename} baixado com sucesso!`);
    }

    // Função para mostrar mensagem de erro
    showError(message) {
        this.clearMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.form-section').appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Função para mostrar mensagem de sucesso
    showSuccess(message) {
        this.clearMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.querySelector('.form-section').appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }

    // Função para limpar mensagens
    clearMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
    }
}

// Inicializar o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new CNPJSystem();
});

// Função para formatar CNPJ enquanto digita
document.addEventListener('DOMContentLoaded', () => {
    const cnpjTextarea = document.getElementById('cnpjs');
    
    cnpjTextarea.addEventListener('blur', (e) => {
        const lines = e.target.value.split('\n');
        const formattedLines = lines.map(line => {
            const cnpj = line.trim().replace(/[^\d]/g, '');
            if (cnpj.length === 14) {
                return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            }
            return line;
        });
        e.target.value = formattedLines.join('\n');
    });
});

