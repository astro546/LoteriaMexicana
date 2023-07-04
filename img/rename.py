import os

img_path = 'img/'
img_files = os.listdir(img_path)

img_new_name = ''

for file in img_files:
    img_new_name = file.replace('+', '-')
    os.rename(f'img/{file}', f'img/{img_new_name}')

    if(os.path.exists(f'img/{img_new_name}')):
        print('Archivo renombrado correctamante')
    else:
        print('Hubo un error')
