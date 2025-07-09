# PWA Icons Guide

## Required Icon Sizes

Para um PWA completo, você precisa criar ícones nos seguintes tamanhos:

### Ícones Básicos
- **72x72px** - Android Chrome, Firefox
- **96x96px** - Android Chrome
- **128x128px** - Chrome Web Store, Android
- **144x144px** - Internet Explorer, Windows
- **152x152px** - iOS Safari
- **192x192px** - Android Chrome (recomendado)
- **384x384px** - Android Chrome
- **512x512px** - Android Chrome (requerido)

### Instruções para Criação

1. **Imagem Original**: Use a logo da FalconTruck em alta resolução
2. **Formato**: PNG com fundo transparente ou sólido
3. **Design**: Certifique-se que o ícone fica legível em tamanhos pequenos
4. **Naming**: Use o padrão `icon-{width}x{height}.png`

### Ferramentas Recomendadas

- **Online**: PWA Builder Image Generator, Favicon Generator
- **Desktop**: Adobe Illustrator, Figma, Sketch
- **Gratuitas**: GIMP, Canva, Paint.NET

### Exemplo de Estrutura
```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

### Dicas de Design

1. **Simplicidade**: Mantenha o design simples e reconhecível
2. **Contraste**: Use cores que contrastem bem com diferentes fundos
3. **Margem**: Deixe uma pequena margem ao redor do ícone
4. **Teste**: Teste os ícones em diferentes dispositivos e tamanhos

**Nota**: Após criar os ícones, substitua os arquivos na pasta `/public/icons/` e teste a instalação do PWA em diferentes dispositivos.