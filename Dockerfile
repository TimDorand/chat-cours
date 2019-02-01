FROM node:8
RUN apt-get update
RUN apt-get install netcat-openbsd

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY ./app .

## Launch the wait tool and then your application
CMD npm start
# CMD [ "npm", "start" ]
