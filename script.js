document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("calc-form");
  const nomeInput = document.getElementById("nome");
  const nomeError = document.getElementById("nome-error");
  const datasolicitacaoInput = document.getElementById("datasolicitacao");
  const datasolicitacaoError = document.getElementById("datasolicitacao-error");

  // Preencher a data de solicitação automaticamente com a data atual
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR");
  datasolicitacaoInput.value = dataFormatada;

  formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Validação do NOME
    if (!nomeInput.value) {
      nomeError.style.display = "block";
      return;
    } else {
      nomeError.style.display = "none";
    }

    // Validação da data de solicitação
    if (!datasolicitacaoInput.value) {
      datasolicitacaoError.style.display = "block";
      return;
    } else {
      datasolicitacaoError.style.display = "none";
    }

    // Mostrar indicador de carregamento
    const submitButton = formulario.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Enviando...";
    submitButton.disabled = true;

    try {
      // Preparar dados do formulário (sem arquivos primeiro)
      const formData = {
        datasolicitacao: datasolicitacaoInput.value,
        nome: nomeInput.value,
        cpf: document.getElementById("cpf").value,
        rg: document.getElementById("rg").value,
        dataNascimento: document.getElementById("dataNascimento").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        dataOcorrencia: document.getElementById("dataOcorrencia").value,
        enderecoOcorrencia: document.getElementById("enderecoOcorrencia").value,
        descricao: document.getElementById("descricao").value,
      };

      // Processar uploads de arquivos como Base64
      await processarArquivos(formData);

      // URL da sua Web App do Google Apps Script após deploy
      const scriptURL =
        "https://script.google.com/macros/s/AKfycbxl5d8hoKp23fIz0lvPGGHmgF3Lao0kja-JZ0_fMgVnF0bOuQtVfZvWePOA1xujlbz_/exec";

      // Enviar dados para o Google Sheets via Google Apps Script
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Exibir mensagem de sucesso
        alert(
          `${formData.nome}, sua solicitação foi recebida com sucesso! Seu número de ocorrência é: ${data.occurrenceNumber}. Em breve entraremos em contato pelo e-mail ou telefone informados.`
        );

        // Limpar o formulário após envio bem-sucedido
        formulario.reset();

        // Restaurar a data atual após reset
        datasolicitacaoInput.value = dataFormatada;
      } else {
        // Exibir mensagem de erro
        alert(`Erro ao enviar: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert(
        "Houve um erro ao enviar o formulário. Por favor, tente novamente mais tarde."
      );
    } finally {
      // Restaurar o botão
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });

  // Função para processar arquivos
  async function processarArquivos(formData) {
    // Função auxiliar para ler um arquivo como Base64
    const lerArquivoComoBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    // Processar documento de identidade
    const docIdentidadeInput = document.getElementById("documentoIdentidade");
    if (docIdentidadeInput.files.length > 0) {
      const file = docIdentidadeInput.files[0];
      formData.documentoIdentidadeBase64 = await lerArquivoComoBase64(file);
      formData.documentoIdentidadeNome = file.name;
    }

    // Processar comprovante de residência
    const comprovanteResidenciaInput = document.getElementById(
      "comprovanteResidencia"
    );
    if (comprovanteResidenciaInput.files.length > 0) {
      const file = comprovanteResidenciaInput.files[0];
      formData.comprovanteResidenciaBase64 = await lerArquivoComoBase64(file);
      formData.comprovanteResidenciaNome = file.name;
    }

    // Processar documento do carro
    const documentoCarroInput = document.getElementById("documentoCarro");
    if (documentoCarroInput.files.length > 0) {
      const file = documentoCarroInput.files[0];
      formData.documentoCarroBase64 = await lerArquivoComoBase64(file);
      formData.documentoCarroNome = file.name;
    }

    // Processar outros documentos (múltiplos)
    const outrosDocumentosInput = document.getElementById("outrosDocumentos");
    if (outrosDocumentosInput.files.length > 0) {
      formData.outrosDocumentosBase64 = [];
      formData.outrosDocumentosNomes = [];

      for (let i = 0; i < outrosDocumentosInput.files.length; i++) {
        const file = outrosDocumentosInput.files[i];
        const base64Data = await lerArquivoComoBase64(file);
        formData.outrosDocumentosBase64.push(base64Data);
        formData.outrosDocumentosNomes.push(file.name);
      }
    }
  }
});
