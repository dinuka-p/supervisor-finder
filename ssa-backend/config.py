from os import environ as env

config = {
    'mysql_host': env.get('DB_HOST', 'db'),
    'mysql_user': env.get('DB_USER','root'),
    'mysql_password': env.get('DB_PW',''),
    'mysql_db': env.get('DB_NAME','supervisor_allocation_db')
}
